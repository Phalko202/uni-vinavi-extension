"""
Generate Chrome Extension Icons from Logo
Converts the uni vinavi logo to required icon sizes (16, 48, 128 pixels)
"""

from PIL import Image
import os

def generate_icons(source_image_path, output_dir):
    """
    Generate icons in multiple sizes from source image
    
    Args:
        source_image_path: Path to the source logo image
        output_dir: Directory to save the generated icons
    """
    # Icon sizes required by Chrome extensions
    sizes = [16, 48, 128]
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Open the source image
    print(f"Opening source image: {source_image_path}")
    img = Image.open(source_image_path)
    
    # Convert to RGBA if necessary (for PNG with transparency)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    print(f"Original size: {img.size}")
    
    # Generate each icon size
    for size in sizes:
        # Resize image while maintaining aspect ratio
        resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save as PNG
        output_path = os.path.join(output_dir, f'icon{size}.png')
        resized_img.save(output_path, 'PNG', quality=95)
        
        print(f"✓ Generated {size}x{size} icon: {output_path}")
    
    print("\n🎉 All icons generated successfully!")
    print(f"Icons saved to: {output_dir}")

if __name__ == "__main__":
    # Paths
    source_logo = r"C:\Users\PHALK\Documents\Coding files\vinavi universal extenion\uni vinavi logo.jpg"
    icons_dir = r"C:\Users\PHALK\Documents\Coding files\vinavi universal extenion\unified-extension\icons"
    
    # Check if source exists
    if not os.path.exists(source_logo):
        print(f"❌ Error: Source logo not found at {source_logo}")
        exit(1)
    
    # Generate icons
    generate_icons(source_logo, icons_dir)
