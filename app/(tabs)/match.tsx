import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, PanResponder, View } from 'react-native';

export const SwipeCard = ({ children, onSwipeLeft, onSwipeRight, style }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const screenWidth = Dimensions.get('window').width;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (e, gestureState) => {
                if (gestureState.dx > screenWidth / 3) {
                    Animated.spring(pan, {
                        toValue: { x: screenWidth, y: 0 },
                        useNativeDriver: true
                    }).start(() => onSwipeRight && onSwipeRight());
                } else if (gestureState.dx < -screenWidth / 3) {
                    Animated.spring(pan, {
                        toValue: { x: -screenWidth, y: 0 },
                        useNativeDriver: true
                    }).start(() => onSwipeLeft && onSwipeLeft());
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    return (
        <Animated.View
            style={[style, { transform: pan.getTranslateTransform() }]}
            {...panResponder.panHandlers}
        >
            <View>{children}</View>
        </Animated.View>
    );
}

export default function MatchScreen() {
    const [imageSize, setImageSize] = useState({ width: 512, height: 512 });

    let image_url = require('../../assets/images/wuwa_05.png');

    useEffect(() => {
        function set_image_render_size(width: number, height: number) {
            console.log('Calculating image size...');
            const window_size = Dimensions.get('window');
            const aspectRatio = width / height;
            const resize_factor = Math.min(window_size.width / width, window_size.height / height);
            const newWidth = width * resize_factor;
            const newHeight = height * resize_factor;
            console.log(`New size: ${newWidth}x${newHeight}`);
            setImageSize({ width: newWidth, height: newHeight });
        }

        console.log('Image URL:', image_url);
        if (typeof image_url === 'number') {
            // local image
            const { width, height } = Image.resolveAssetSource(image_url);
            set_image_render_size(width, height);
        } else if (image_url.width && image_url.height) {
            // already has width and height
            console.log('Image already has dimensions:', image_url.width, image_url.height);
            set_image_render_size(image_url.width, image_url.height);
        }
        else {
            // remote image
            Image.getSize(image_url, (width, height) => {
                set_image_render_size(width, height);
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }, [image_url]);

    return (
        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <SwipeCard style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                onSwipeLeft={() => console.log('Swiped Left')}
                onSwipeRight={() => console.log('Swiped Right')}
            >
                <Image
                    style={{ width: imageSize.width, height: imageSize.height }}
                    source={image_url}
                    resizeMode="contain"
                />
            </SwipeCard>
        </View>
    );
}