from PIL import Image

def remove_black_bg(input_path, output_path, threshold=20):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if the pixel is dark enough to be considered background
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Change the pixel to transparent
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

remove_black_bg('public/3d-avatar.png', 'public/3d-avatar.png', threshold=25)
