param([Parameter(Mandatory=$true)][string]$Gugu,[Parameter(Mandatory=$true)][string]$Penguin)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$target=Join-Path $PSScriptRoot '../dist/assets/catalog'
foreach($item in @(@{Name='gugu';Path=$Gugu},@{Name='penguin';Path=$Penguin})){
 $source=[System.Drawing.Image]::FromFile($item.Path)
 for($i=0;$i -lt 12;$i++){
  $width=$source.Width/3;$height=$source.Height/4
  $cell=[System.Drawing.RectangleF]::new(($i%3)*$width,[math]::Floor($i/3)*$height,$width,$height)
  $bmp=[System.Drawing.Bitmap]::new(320,320,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $scale=[math]::Min(320/$width,320/$height);$w=$width*$scale;$h=$height*$scale
  $g.DrawImage($source,[System.Drawing.RectangleF]::new((320-$w)/2,(320-$h)/2,$w,$h),$cell,[System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose();$name='{0}-{1:D2}.png' -f $item.Name,($i+1)
  $bmp.Save((Join-Path $target $name),[System.Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose()
 }
 $source.Dispose()
}
Write-Output 'Extracted 12 gugu and 12 penguin sticker cells.'
