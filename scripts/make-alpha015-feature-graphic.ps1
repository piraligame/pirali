# Play Console feature graphic, 1024 x 500, using the game's own approved background artwork.
Add-Type -AssemblyName System.Drawing
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source=Join-Path $root 'alpha015-play\assets\images\ui\menu-background.jpg'
$destination=Join-Path $root 'store-assets\feature-graphic-1024x500.png'
New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
$original=[System.Drawing.Image]::FromFile($source)
$bitmap=New-Object System.Drawing.Bitmap(1024,500)
$g=[System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint=[System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$crop=New-Object System.Drawing.Rectangle(0,95,$original.Width,750)
$dest=New-Object System.Drawing.Rectangle(0,0,1024,500)
$g.DrawImage($original,$dest,$crop,[System.Drawing.GraphicsUnit]::Pixel)
$boxBrush=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215,22,14,6))
$borderBrush=New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220,239,188,77),2)
$panel=New-Object System.Drawing.Rectangle(515,300,485,162)
$g.FillRectangle($boxBrush,$panel)
$g.DrawRectangle($borderBrush,$panel)
$gold=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,245,186,48))
$light=New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,248,226,183))
$font=New-Object System.Drawing.Font('Georgia',63,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
$sub=New-Object System.Drawing.Font('Arial',21,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('PIRALI',$font,$gold,535,312)
$g.DrawString('RISE OF THE OUTLAW',$sub,$light,545,414)
$bitmap.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
$font.Dispose();$sub.Dispose();$gold.Dispose();$light.Dispose();$boxBrush.Dispose();$borderBrush.Dispose();$g.Dispose();$bitmap.Dispose();$original.Dispose()
Write-Output ('FEATURE_GRAPHIC_READY='+$destination)
