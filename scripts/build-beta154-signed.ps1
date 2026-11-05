# PIRALI Beta 1.54 (fresh Firebase leaderboard) - signed Play update v23
# Uses the existing Alpha 0.15 upload key, protected locally. Never commit secrets.
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$src=Join-Path $root 'beta154-play'
$builder=Join-Path $env:USERPROFILE 'Documents\PIRALI_ANDROID_TOOLS\PIRALI_FINAL_PLAY_SPARSE'
$sdk=Join-Path $env:USERPROFILE 'Documents\PIRALI_ANDROID_TOOLS\android-sdk'
$sign=Join-Path $env:USERPROFILE 'Documents\PIRALI_SIGNING_KEEP_PRIVATE'
$key=Join-Path $sign 'PIRALI-ALPHA-UPLOAD-KEY.p12'
$passFile=Join-Path $sign 'alpha-password.dpapi.txt'
$out=Join-Path $env:USERPROFILE 'OneDrive\Desktop\PIRALI_GOOGLE_PLAY_UPLOAD_BETA_1.54'
$gitOut=Join-Path $root 'downloads\beta154'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot'
$env:ANDROID_HOME=$sdk
$env:ANDROID_SDK_ROOT=$sdk
$env:Path=(Join-Path $env:JAVA_HOME 'bin')+';'+$env:Path
if(!(Test-Path $key) -or !(Test-Path $passFile)){throw 'Existing signing key missing. Do not generate a new key.'}
$html=Get-Content -Raw -Encoding UTF8 (Join-Path $src 'index.html')
if(!$html.Contains("window.PiraliGameVersion='1.54-classic.play'") -or !$html.Contains('window.PiraliSeasonReleaseEnabled=true;') -or !$html.Contains('/pirali_release_154_rating/') -or !$html.Contains('window.PiraliVisualPreviewReadonly=false;')){throw 'Not the official Beta 1.54 Player with new online leaderboard.'}
if($html.Contains('<script src="js/preview-controls.js')){throw 'DEV controls detected in Player.'}
$metaPath=Join-Path $src 'RELEASE_INFO.json'
$meta=Get-Content -Raw -Encoding UTF8 $metaPath | ConvertFrom-Json
if($meta.firebaseWritesBlocked -or $meta.firebasePath -ne '/pirali_release_154_rating'){throw 'Player metadata does not match Firebase go-live'}
$meta | Add-Member -NotePropertyName androidVersionCode -NotePropertyValue 23 -Force
$meta.androidBuilt=$true
$meta.aabBuilt=$true
$meta.releaseReady=$true
[IO.File]::WriteAllText($metaPath,($meta | ConvertTo-Json -Depth 40)+"`n",[Text.UTF8Encoding]::new($false))
$dest=Join-Path $builder 'dist\android-web'
$marker=Join-Path $dest '.pirali-generated-bundle'
if((Test-Path $dest) -and !(Test-Path $marker)){throw 'Refusing to replace non-generated output'}
if(Test-Path $dest){Remove-Item $dest -Recurse -Force}
New-Item -ItemType Directory -Force $dest|Out-Null
foreach($name in @('index.html','manifest.json','RELEASE_INFO.json','privacy.html','TEST_INFO.json')){
 $item=Join-Path $src $name
 if(Test-Path $item){Copy-Item $item $dest}
}
foreach($name in @('assets','css','js','data','firebase')){
 $item=Join-Path $src $name
 if(Test-Path $item){Copy-Item $item $dest -Recurse}
}
$devFile=Join-Path $dest 'js\preview-controls.js'
if(Test-Path $devFile){Remove-Item $devFile -Force}
Set-Content -Path $marker -Value 'PIRALI Beta 1.54 freshly generated PLAYER bundle' -Encoding Ascii
$gradleFile=Join-Path $builder 'android\app\build.gradle'
$gradle=Get-Content -Raw $gradleFile
if($gradle -notmatch 'applicationId "ge.piraligame.pirali"' -or ($gradle -notmatch 'versionCode 22' -and $gradle -notmatch 'versionCode 23') -or ($gradle -notmatch 'versionName "1.52"' -and $gradle -notmatch 'versionName "1.54"')){throw 'Unexpected native version or package'}
$gradle=$gradle.Replace('versionCode 22','versionCode 23')
$gradle=$gradle.Replace('versionName "1.52"','versionName "1.54"')
[IO.File]::WriteAllText($gradleFile,$gradle,[Text.UTF8Encoding]::new($false))
$plain=(New-Object System.Net.NetworkCredential('',(Get-Content -Raw $passFile | ConvertTo-SecureString))).Password
if([String]::IsNullOrEmpty($plain)){throw 'Cannot unlock existing signing secret'}
$env:PIRALI_ALPHA_KEYSTORE_PATH=$key
$env:PIRALI_ALPHA_STORE_PASSWORD=$plain
$env:PIRALI_ALPHA_KEY_PASSWORD=$plain
$env:PIRALI_ALPHA_KEY_ALIAS='pirali_alpha'
try{
 Push-Location $builder
 try{
  & (Join-Path $builder 'node_modules\.bin\cap.cmd') sync android
  if($LASTEXITCODE -ne 0){throw 'Capacitor Android sync failed'}
  & subst.exe 'Q:' $builder
  if($LASTEXITCODE -ne 0){throw 'Temporary Gradle drive mount failed'}
  try{
   Push-Location 'Q:\android'
   try{& '.\gradlew.bat' --no-daemon assembleRelease bundleRelease; if($LASTEXITCODE -ne 0){throw 'Gradle signed release failed'}}
   finally{Pop-Location}
   $apk='Q:\android\app\build\outputs\apk\release\app-release.apk'
   $aab='Q:\android\app\build\outputs\bundle\release\app-release.aab'
   if(!(Test-Path $apk) -or !(Test-Path $aab)){throw 'Signed build output missing'}
   $apksigner=Join-Path $sdk 'build-tools\36.0.0\apksigner.bat'
   $aapt=Join-Path $sdk 'build-tools\36.0.0\aapt.exe'
   & $apksigner verify --print-certs $apk | Out-Null
   if($LASTEXITCODE -ne 0){throw 'APK signature invalid'}
   & (Join-Path $env:JAVA_HOME 'bin\jarsigner.exe') -verify $aab | Out-Null
   if($LASTEXITCODE -ne 0){throw 'AAB signature invalid'}
   $badge=& $aapt dump badging $apk
   if($LASTEXITCODE -ne 0 -or -not ($badge | Select-String "name='ge.piraligame.pirali' versionCode='23' versionName='1.54'")){throw 'Android package/version code mismatch'}
   $old=Join-Path $env:USERPROFILE 'OneDrive\Desktop\PIRALI_GOOGLE_PLAY_UPLOAD_0.15\PIRALI_Alpha_Test_0.15_FINAL.apk'
   $oldCert=(& $apksigner verify --print-certs $old | Select-String 'Signer #1 certificate SHA-256 digest')
   $newCert=(& $apksigner verify --print-certs $apk | Select-String 'Signer #1 certificate SHA-256 digest')
   if(!$oldCert -or !$newCert -or $oldCert.ToString().Trim() -ne $newCert.ToString().Trim()){throw 'Alpha 0.15 signing certificate mismatch'}
   Add-Type -AssemblyName System.IO.Compression.FileSystem
   $zip=[IO.Compression.ZipFile]::OpenRead($aab)
   try{
    $entry=$zip.GetEntry('base/assets/public/index.html')
    if(!$entry){throw 'AAB missing game index'}
    $stream=$entry.Open()
    try{$hash=[Security.Cryptography.SHA256]::Create();$inApk=([BitConverter]::ToString($hash.ComputeHash($stream))).Replace('-','')}
    finally{$stream.Dispose()}
   }finally{$zip.Dispose()}
   $srcHash=(Get-FileHash -Path (Join-Path $src 'index.html') -Algorithm SHA256).Hash
   if($inApk -ne $srcHash){throw 'Signed AAB has wrong game source'}
   New-Item -ItemType Directory -Force $out|Out-Null
   New-Item -ItemType Directory -Force $gitOut|Out-Null
   $apkName='PIRALI_Beta_1.54_Reset_Signed_v23.apk'
   $aabName='PIRALI_Beta_1.54_Reset_Play_v23.aab'
   foreach($dir in @($out,$gitOut)){Copy-Item $apk (Join-Path $dir $apkName) -Force; Copy-Item $aab (Join-Path $dir $aabName) -Force}
   $details=@{packageId='ge.piraligame.pirali';versionCode=23;versionName='1.54';season='pirali_release_154_s1';leaderboardPath='/pirali_release_154_rating';firebaseWritesEnabled=$true;oldLeaderboardPreserved=$true;certificatesMatchAlpha015=$true;sourceIndexSha256=$srcHash;apkSha256=(Get-FileHash $apk -Algorithm SHA256).Hash;aabSha256=(Get-FileHash $aab -Algorithm SHA256).Hash;apk=$apkName;aab=$aabName;builtOn=(Get-Date).ToString('o')}
   foreach($dir in @($out,$gitOut)){$details|ConvertTo-Json|Set-Content (Join-Path $dir 'PIRALI_Beta_1.54_Reset_v23_INFO.json') -Encoding UTF8}
   Write-Output 'PIRALI_BETA154_NEW_SEASON_SIGNED_SUCCESS'
   Write-Output ('NEW_SEASON_AAB='+ (Join-Path $out $aabName))
   Write-Output ('NEW_SEASON_APK='+ (Join-Path $out $apkName))
   Write-Output ('SHA256_AAB='+$details.aabSha256)
  }finally{& subst.exe 'Q:' /D|Out-Null}
 }finally{Pop-Location}
}finally{
 Remove-Item Env:PIRALI_ALPHA_KEYSTORE_PATH -ErrorAction SilentlyContinue
 Remove-Item Env:PIRALI_ALPHA_STORE_PASSWORD -ErrorAction SilentlyContinue
 Remove-Item Env:PIRALI_ALPHA_KEY_PASSWORD -ErrorAction SilentlyContinue
 Remove-Item Env:PIRALI_ALPHA_KEY_ALIAS -ErrorAction SilentlyContinue
 $plain=$null
}
