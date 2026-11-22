param([Parameter(Mandatory=$true)][string]$Back,[Parameter(Mandatory=$true)][string]$Front)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$target=Join-Path $PSScriptRoot '../dist/assets/opening'
New-Item -ItemType Directory -Path $target -Force | Out-Null
foreach($item in @(@{Name='back';Path=$Back},@{Name='front';Path=$Front})){
 $src=[System.Drawing.Image]::FromFile($item.Path)
 $factor=[math]::Min(1,850/[math]::Max($src.Width,$src.Height))
 $width=[int][math]::Round($src.Width*$factor);$height=[int][math]::Round($src.Height*$factor)
 $bmp=[System.Drawing.Bitmap]::new($width,$height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.DrawImage($src,0,0,$width,$height);$g.Dispose()
 $bmp.Save((Join-Path $target ($item.Name+'.png')),[System.Drawing.Imaging.ImageFormat]::Png)
 $bmp.Dispose();$src.Dispose()
}
Write-Output 'Saved the two transparent opening assets.'
