$ErrorActionPreference='Stop'
$root=Resolve-Path (Join-Path $PSScriptRoot '..')
# This release is Alpha 0.14.1 from the isolated approved Study D player channel.
$gradleVersion = Get-Content (Join-Path $root 'android\app\build.gradle') -Raw
if($gradleVersion -notmatch 'versionCode\s+16\s+versionName\s+"0\.14\.1"'){throw 'Not version 0.14.1/16: refusing final update build'}
$sdk=Join-Path $env:USERPROFILE 'Documents\PIRALI_ANDROID_TOOLS\android-sdk'
$sign=Join-Path $env:USERPROFILE 'Documents\PIRALI_SIGNING_KEEP_PRIVATE'
$key=Join-Path $sign 'PIRALI-ALPHA-UPLOAD-KEY.p12'
$secret=Join-Path $sign 'alpha-password.dpapi.txt'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot'
$env:ANDROID_HOME=$sdk
$env:ANDROID_SDK_ROOT=$sdk
$env:Path=(Join-Path $env:JAVA_HOME 'bin')+';'+$env:Path
if(-not (Test-Path $key) -or -not (Test-Path $secret)){throw 'Signing key is missing; do not generate a new key if an APK was already released!'}
if(-not (Test-Path (Join-Path $sdk 'build-tools\36.0.0\apksigner.bat'))){throw 'Android SDK build tools missing'}
$secure=(Get-Content -Raw -Path $secret | ConvertTo-SecureString)
$plain=(New-Object System.Net.NetworkCredential('', $secure)).Password
if([String]::IsNullOrEmpty($plain)){throw 'Could not unlock Windows DPAPI signing password'}
$env:PIRALI_ALPHA_KEYSTORE_PATH=$key
$env:PIRALI_ALPHA_STORE_PASSWORD=$plain
$env:PIRALI_ALPHA_KEY_PASSWORD=$plain
$env:PIRALI_ALPHA_KEY_ALIAS='pirali_alpha'
try{
  Push-Location $root
  try{
    & node.exe scripts/build-alpha0141-player-web.cjs
    if($LASTEXITCODE -ne 0){throw 'npm web build failed'}
    & (Join-Path $root 'node_modules\.bin\cap.cmd') sync android
    if($LASTEXITCODE -ne 0){throw 'Capacitor Android sync failed'}
    # Gradle's Windows .bat launcher cannot handle Georgian characters in the Desktop path.
    # Use a temporary ASCII-only virtual drive to preserve the ORIGINAL source tree.
    if(Test-Path 'Q:\\'){throw 'Drive Q: is already in use; choose another temporary drive'}
    & subst.exe 'Q:' $root
    if($LASTEXITCODE -ne 0){throw 'Could not create temporary build drive'}
    try{
      Push-Location 'Q:\\android'
      try{
        & '.\\gradlew.bat' --no-daemon assembleRelease bundleRelease
        if($LASTEXITCODE -ne 0){throw 'Android signed release build failed'}
      }finally{Pop-Location}
    }finally{
      & subst.exe 'Q:' /D | Out-Null
    }
    $apk=Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
    $aab=Join-Path $root 'android\app\build\outputs\bundle\release\app-release.aab'
    if(-not (Test-Path $apk) -or -not (Test-Path $aab)){throw 'Compiled APK/AAB missing'}
    $apksigner=Join-Path $sdk 'build-tools\36.0.0\apksigner.bat'
    $jarsigner=Join-Path $env:JAVA_HOME 'bin\jarsigner.exe'
    # Java-based verification tools also cannot resolve the Unicode Georgian folder.
    & subst.exe 'Q:' $root
    if($LASTEXITCODE -ne 0){throw 'Temporary signing verification drive failed'}
    try{
      & $apksigner verify --verbose --print-certs 'Q:\android\app\build\outputs\apk\release\app-release.apk'
      if($LASTEXITCODE -ne 0){throw 'APK signing verification failed'}
      & $jarsigner -verify 'Q:\android\app\build\outputs\bundle\release\app-release.aab'
      if($LASTEXITCODE -ne 0){throw 'AAB signing verification failed'}
      $aapt=Join-Path $sdk 'build-tools\36.0.0\aapt.exe'
      $badging=& $aapt dump badging 'Q:\android\app\build\outputs\apk\release\app-release.apk'
      if($LASTEXITCODE -ne 0){throw 'APK manifest inspection failed'}
      if(-not ($badging | Select-String "name='ge.piraligame.pirali' versionCode='16' versionName='0.14.1'")){throw 'Android package/version mismatch'}
      Write-Output (($badging | Select-String '^(package:|application-label:)') | Select-Object -First 2)
    }finally{
      & subst.exe 'Q:' /D | Out-Null
    }
    $version=(Select-String -Path (Join-Path $root 'android\app\build.gradle') -Pattern 'versionName\s+"([^"]+)"' | Select-Object -First 1).Matches.Groups[1].Value
    $code=(Select-String -Path (Join-Path $root 'android\app\build.gradle') -Pattern 'versionCode\s+(\d+)' | Select-Object -First 1).Matches.Groups[1].Value
    $out=Join-Path (Split-Path $root) 'PIRALI_ALPHA_RELEASES'
    New-Item -ItemType Directory -Force -Path $out | Out-Null
    $apkOut=Join-Path $out ('PIRALI_Alpha_Test_'+$version+'_FINAL.apk')
    $aabOut=Join-Path $out ('PIRALI_Alpha_Test_'+$version+'_FINAL.aab')
    if((Test-Path $apkOut) -or (Test-Path $aabOut)){throw 'Release already exists, refusing to overwrite'}
    Copy-Item $apk $apkOut
    Copy-Item $aab $aabOut
    $shaApk=(Get-FileHash -Algorithm SHA256 $apkOut).Hash
    $shaAab=(Get-FileHash -Algorithm SHA256 $aabOut).Hash
    $manifest=@{name='PIRALI Alpha Test';version=$version;versionCode=[int]$code;appId='ge.piraligame.pirali';apk=$apkOut;aab=$aabOut;sha256Apk=$shaApk;sha256Aab=$shaAab}
    $manifest | ConvertTo-Json | Set-Content (Join-Path $out ('PIRALI_Alpha_Test_'+$version+'_FINAL_MANIFEST.json')) -Encoding UTF8
    Write-Output ("PIRALI_SIGNED_RELEASE_SUCCESS version="+$version+" code="+$code)
    Write-Output ("APK="+$apkOut)
    Write-Output ("AAB="+$aabOut)
    Write-Output ("APK_SHA256="+$shaApk)
  }finally{Pop-Location}
}finally{
  Remove-Item Env:PIRALI_ALPHA_KEYSTORE_PATH -ErrorAction SilentlyContinue
  Remove-Item Env:PIRALI_ALPHA_STORE_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:PIRALI_ALPHA_KEY_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:PIRALI_ALPHA_KEY_ALIAS -ErrorAction SilentlyContinue
  $plain=$null
}
