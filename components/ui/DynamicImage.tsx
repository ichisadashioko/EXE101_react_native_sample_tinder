// import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';


export function DynamicImage({
    source, style,
    container_size = { width: 512, height: 512 },
}) {
    const [imageSize, setImageSize] = useState({
        real_width: 0,
        real_height: 0,
        width: 512,
        height: 512,
        updated: false
    });

    let internal_source = null;

    if (typeof source === 'object' && source.uri && source.width && source.height) {
        internal_source = source;
    } else if (typeof source === 'string') {
        internal_source = { uri: source };
    } else if (typeof source === 'number') {
        // internal_source = Image.resolveAssetSource(source);
        internal_source = source; // Assuming source is a local image asset
    } else {
        console.error('Invalid source type for DynamicImage:', source);
        return null;
    }

    function set_image_render_size(
        width: number,
        height: number,
        container_size: { width: number, height: number } = { width: 512, height: 512 }
    ) {
        console.log('Calculating image size...');
        // const window_size = Dimensions.get('window');
        const resize_factor = Math.min(container_size.width / width, container_size.height / height);
        const newWidth = width * resize_factor;
        const newHeight = height * resize_factor;
        console.log(`New size: ${newWidth}x${newHeight}`);
        setImageSize({
            real_width: width,
            real_height: height,
            width: newWidth, height: newHeight, updated: true
        });
    }

    useEffect(() => {
        console.log('image_source:', internal_source);
        if (typeof internal_source === 'number') {
            // local image
            const { width, height } = Image.resolveAssetSource(internal_source);
            set_image_render_size(width, height, container_size);
        } else if (internal_source.width && internal_source.height) {
            // already has width and height
            console.log('Image already has dimensions:', internal_source.width, internal_source.height);
            set_image_render_size(internal_source.width, internal_source.height, container_size);
        }
        else {
            // remote image
            Image.getSize(internal_source.uri, (width, height) => {
                set_image_render_size(width, height, container_size);
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }, [internal_source, container_size]);

    return (
        <Image
            // source={internal_source}
            // style={{ width: imageSize.width, height: imageSize.height }}
            // contentFit='contain'
            // onLoad={(evt) => {
            //     console.log('Image loaded:', evt);
            //     if (evt.source.width && evt.source.height) {
            //         set_image_render_size(evt.source.width, evt.source.height, container_size);
            //     }
            // }}
            source={internal_source}
            style={{ width: imageSize.width, height: imageSize.height }}
            resizeMode='contain'
        />
    );
}