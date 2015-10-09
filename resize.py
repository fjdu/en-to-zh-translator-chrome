import PIL
from PIL import Image

final_width = 1280
final_height = 800

img = Image.open('x.png')
print 'Original size =', img.size
width_0, height_0 = img.size
height_1 = int(float(width_0) * final_height / final_width)
print width_0, height_1
img = img.crop((0,0,width_0,height_1))
img = img.resize((final_width, final_height))
img.save('resized.png', resample=1)
