# PIRALI Beta 1.15 — signed update to the existing Alpha 0.15 Android package.
# Keystore and passwords are NEVER printed, stored in Git, or sent to GitHub Actions.
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sdk=Join-Path $env:USERPROFILE 'Documents\PIRALI_ANDROID_TOOLS\android-sdk'
$sign=Join-Path $env:USERPROFILE 'Documents\PIRALI_SIGNING_KEEP_PRIVATE'
$key=Join-Path $sign 'PIRALI-ALPHA-UPLOAD-KEY.p12'
$dpapi=Join-Path $sign 'alpha-password.dpapi.txt'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot'
$env:ANDROID_HOME=$sdk
$env:ANDROID_SDK_ROOT=$sdk
$env:Path=(Join-Path $env:JAVA_HOME 'bin')+';'+$env:Path
if(-not (Test-Path $key) -or -not (Test-Path $dpapi)){throw 'Existing signed upload key or DPAPI password file is missing. DO NOT generate a new one.'}
if(-not (Test-Path (Join-Path $sdk 'build-tools\36.0.0\apksigner.bat'))){throw 'Android SDK build tools missing'}
$gradle=Get-Content -Raw -Path (Join-Path $root 'android\app\build.gradle')
if($gradle -notmatch 'applicationId "ge.piraligame.pirali"' -or $gradle -notmatch 'versionCode 20' -or $gradle -notmatch 'versionName "1.15"'){
 throw 'Unexpected Android app ID or version: refuse to sign an incompatible package'
}
$plain=(New-Object System.Net.NetworkCredential('',(Get-Content -Raw -Path $dpapi | ConvertTo-SecureString))).Password
if([String]::IsNullOrEmpty($plain)){throw 'DPAPI could not unlock EXISTING signing password'}
$env:PIRALI_ALPHA_KEYSTORE_PATH=$key
$env:PIRALI_ALPHA_STORE_PASSWORD=$plain
$env:PIRALI_ALPHA_KEY_PASSWORD=$plain
$env:PIRALI_ALPHA_KEY_ALIAS='pirali_alpha'
try{
 Push-Location $root
 try {
  & npm.cmd run build:android-beta115
  if($LASTEXITCODE -ne 0){throw 'Beta 1.15 web bundle failed'}
  & (Join-Path $root 'node_modules\.bin\cap.cmd') sync android
  if($LASTEXITCODE -ne 0){throw 'Capacitor sync failed'}
  & subst.exe 'Q:' $root
  if($LASTEXITCODE -ne 0){throw 'Could not create short ASCII drive for Gradle'}
  try{
   Push-Location 'Q:\android'
   try{
    & '.\gradlew.bat' --no-daemon assembleRelease bundleRelease
    if($LASTEXITCODE -ne 0){throw 'Signed Android Release build failed'}
   }finally{Pop-Location}
   $apk='Q:\android\app\build\outputs\apk\release\app-release.apk'
   $aab='Q:\android\app\build\outputs\bundle\release\app-release.aab'
   if(-not (Test-Path $apk) -or -not (Test-Path $aab)){throw 'Signed APK/AAB not found'}
   & (Join-Path $sdk 'build-tools\36.0.0\apksigner.bat') verify --verbose --print-certs $apk
   if($LASTEXITCODE -ne 0){throw 'APK signature verification failed'}
   & (Join-Path $env:JAVA_HOME 'bin\jarsigner.exe') -verify $aab
   if($LASTEXITCODE -ne 0){throw 'AAB signature verification failed'}
   $badging=& (Join-Path $sdk 'build-tools\36.0.0\aapt.exe') dump badging $apk
   if($LASTEXITCODE -ne 0){throw 'APK aapt badging failed'}
   if(-not ($badging | Select-String "name='ge.piraligame.pirali' versionCode='20' versionName='1.15'")){
    throw 'APK has wrong app ID or version code'
   }
   $previous=Join-Path $env:USERPROFILE 'OneDrive\Desktop\PIRALI_GOOGLE_PLAY_UPLOAD_0.15\PIRALI_Alpha_Test_0.15_FINAL.apk'
   if(Test-Path $previous){
    $prevOut=(& (Join-Path $sdk 'build-tools\36.0.0\apksigner.bat') verify --print-certs $previous | Select-String 'Signer #1 certificate SHA-256 digest')
    $newOut=(& (Join-Path $sdk 'build-tools\36.0.0\apksigner.bat') verify --print-certs $apk | Select-String 'Signer #1 certificate SHA-256 digest')
    if(-not $prevOut -or -not $newOut -or ($prevOut.ToString().Split(':')[-1].Trim() -ne $newOut.ToString().Split(':')[-1].Trim())){
     throw 'Signing identity does not match installed Alpha 0.15. REFUSE distribution.'
    }
    Write-Output 'ALPHA_015_SIGNER_MATCH=YES'
   }else{Write-Output 'ALPHA_015_SIGNER_MATCH=NOT_CHECKED_OLD_APK_NOT_FOUND'}
   $previousAab=Join-Path $env:USERPROFILE 'OneDrive\Desktop\PIRALI_GOOGLE_PLAY_UPLOAD_0.15\PIRALI_Alpha_Test_0.15_FINAL.aab'
   $aabCertTool=Join-Path $env:JAVA_HOME 'bin\keytool.exe'
   if(-not(Test-Path $previousAab)){throw 'Alpha 0.15 upload AAB unavailable: cannot verify matching Google Play signing key'}
   $oldCertificate=(& $aabCertTool -printcert -jarfile $previousAab 2>&1 | Select-String 'SHA256:' | Select-Object -First 1)
   $newCertificate=(& $aabCertTool -printcert -jarfile $aab 2>&1 | Select-String 'SHA256:' | Select-Object -First 1)
   if(-not $oldCertificate -or -not $newCertificate -or $oldCertificate.ToString().Trim() -ne $newCertificate.ToString().Trim()){
    throw 'Beta 1.15 AAB upload certificate differs from Alpha 0.15. REFUSE release.'
   }
   Write-Output 'ALPHA_015_AAB_UPLOAD_CERT_MATCH=YES'
   $beta113Aab=Join-Path $env:USERPROFILE 'OneDrive\Desktop\PIRALI_GOOGLE_PLAY_UPLOAD_BETA_1.13\PIRALI_Beta_1.13_Play_Upload.aab'
   if(Test-Path $beta113Aab){
    $beta113Certificate=(& $aabCertTool -printcert -jarfile $beta113Aab 2>&1 | Select-String 'SHA256:' | Select-Object -First 1)
    if(-not $beta113Certificate -or $beta113Certificate.ToString().Trim() -ne $newCertificate.ToString().Trim()){
     throw 'Beta 1.15 AAB upload certificate differs from signed Beta 1.13. REFUSE release.'
    }
    Write-Output 'BETA_113_AAB_UPLOAD_CERT_MATCH=YES'
   }
   $out=Join-Path $root 'downloads\beta115'
   New-Item -ItemType Directory -Path $out -Force|Out-Null
   $apkOut=Join-Path $out 'PIRALI_Beta_1.15_Signed_Update.apk'
   $aabOut=Join-Path $out 'PIRALI_Beta_1.15_Play_Upload.aab'
   if((Test-Path $apkOut) -or (Test-Path $aabOut)){throw 'Version 1.15 output already exists; never overwrite signed release'}
   Copy-Item $apk $apkOut
   Copy-Item $aab $aabOut
   $manifest=@{
    versionName='1.15';versionCode=20;appId='ge.piraligame.pirali';
    source='beta115-play';updateFrom='Alpha 0.15 versionCode 18';
    signedWithExistingKeystore=$true;
    apkPath=$apkOut;aabPath=$aabOut;
    apkSha256=(Get-FileHash -Algorithm SHA256 -Path $apkOut).Hash;
    aabSha256=(Get-FileHash -Algorithm SHA256 -Path $aabOut).Hash
   }
   $manifest|ConvertTo-Json|Set-Content (Join-Path $out 'PIRALI_Beta_1.15_RELEASE_INFO.json') -Encoding utf8
   Write-Output 'PIRALI_BETA_115_SIGNED_RELEASE_SUCCESS'
   Write-Output ('APK_SIZE_BYTES='+((Get-Item $apkOut).Length))
   Write-Output ('AAB_SIZE_BYTES='+((Get-Item $aabOut).Length))
   Write-Output ('PACKAGE=ge.piraligame.pirali VERSION_CODE=20 VERSION_NAME=1.15')
   Write-Output ('APK_SHA256='+$manifest.apkSha256)
   Write-Output ('AAB_SHA256='+$manifest.aabSha256)
  }finally{& subst.exe 'Q:' /D|Out-Null}
 }finally{Pop-Location}
}finally{
 Remove-Item Env:PIRALI_ALPHA_KEYSTORE_PATH -ErrorAction SilentlyContinue
 Remove-Item Env:PIRALI_ALPHA_STORE_PASSWORD -ErrorAction SilentlyContinue
 Remove-Item Env:PIRALI_ALPHA_KEY_PASSWORD -ErrorAction SilentlyContinue
 Remove-Item Env:PIRALI_ALPHA_KEY_ALIAS -ErrorAction SilentlyContinue
 $plain=$null
}
