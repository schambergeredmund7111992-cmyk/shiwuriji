param([Parameter(Mandatory=$true)][string]$Momo,[Parameter(Mandatory=$true)][string]$Anniversary,[Parameter(Mandatory=$true)][string]$MomoSheet,[Parameter(Mandatory=$true)][string]$MilkSheet)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot=Join-Path $PSScriptRoot '../dist/assets'
$catalogRoot=Join-Path $assetRoot 'catalog'
New-Item -ItemType Directory -Path $catalogRoot -Force | Out-Null
function Save-Sized([string]$Source,[string]$Target,[int]$Width,[int]$Height){
 $src=[System.Drawing.Image]::FromFile($Source)
 $bmp=[System.Drawing.Bitmap]::new($Width,$Height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $g.DrawImage($src,0,0,$Width,$Height);$g.Dispose();$bmp.Save($Target,[System.Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose();$src.Dispose()
}
Save-Sized $Momo (Join-Path $assetRoot 'momo.png') 320 320
Save-Sized $Anniversary (Join-Path $assetRoot 'anniversary.png') 900 300
foreach($entry in @(@{Name='momo';Path=$MomoSheet},@{Name='milk';Path=$MilkSheet})){
 $sheet=[System.Drawing.Image]::FromFile($entry.Path)
 for($i=0;$i -lt 16;$i++){
  $bmp=[System.Drawing.Bitmap]::new(320,320,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $row=[int][math]::Floor($i/4)
  $cuts=if($entry.Name -eq 'milk'){@(0,(332/1254),(635/1254),(938/1254),1)}else{@(0,.25,.5,.75,1)}
  $cell=[System.Drawing.RectangleF]::new(($i%4)*$sheet.Width/4,$cuts[$row]*$sheet.Height,$sheet.Width/4,($cuts[$row+1]-$cuts[$row])*$sheet.Height)
  $g.DrawImage($sheet,[System.Drawing.RectangleF]::new(0,0,320,320),$cell,[System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose();$name='{0}-{1:D2}.png' -f $entry.Name,($i+1)
  $bmp.Save((Join-Path $catalogRoot $name),[System.Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose()
 }
 $sheet.Dispose()
}
Write-Output 'Packaged 32 transparent stickers and two header assets.'
