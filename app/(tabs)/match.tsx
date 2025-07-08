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
                    }).start(() => {
                        pan.setValue({ x: 0, y: 0 }); // Reset position after swipe
                        onSwipeRight && onSwipeRight();
                    });
                } else if (gestureState.dx < -screenWidth / 3) {
                    Animated.spring(pan, {
                        toValue: { x: -screenWidth, y: 0 },
                        useNativeDriver: true
                    }).start(() => {
                        pan.setValue({ x: 0, y: 0 }); // Reset position after swipe
                        onSwipeLeft && onSwipeLeft();
                    });
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        pan.setValue({ x: 0, y: 0 }); // Reset position when component remounts or children change
    }, [children]);

    return (
        <Animated.View
            style={[style, { transform: pan.getTranslateTransform() }]}
            {...panResponder.panHandlers}
        >
            <View>{children}</View>
        </Animated.View>
    );
}

export function DynamicImage({ source, style }) {
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
            set_image_render_size(width, height);
        } else if (internal_source.width && internal_source.height) {
            // already has width and height
            console.log('Image already has dimensions:', internal_source.width, internal_source.height);
            set_image_render_size(internal_source.width, internal_source.height);
        }
        else {
            // remote image
            Image.getSize(internal_source.uri, (width, height) => {
                set_image_render_size(width, height);
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }, [internal_source]);

    return (
        <View
            onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                if (imageSize.updated) {
                    set_image_render_size(
                        imageSize.real_width,
                        imageSize.real_height,
                        { width, height }
                    );
                }
            }}
            style={[{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }, style]}
        >
            <Image
                source={internal_source}
                style={{ width: imageSize.width, height: imageSize.height }}
                resizeMode='contain'
            />
        </View>
    );
}

export default function MatchScreen() {
    const [cards, setCards] = useState([
        require('../../assets/images/wuwa_01.png'),
        require('../../assets/images/wuwa_02.png'),
        require('../../assets/images/wuwa_03.png'),
        require('../../assets/images/wuwa_04.png'),
        require('../../assets/images/wuwa_05.png'),
        // ...more
    ]);

    const handleSwipe = () => {
        setCards(prev => prev.slice(1));
    };

    let image_url = require('../../assets/images/wuwa_05.png');

    return (
        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {cards.length > 1 && (
                <DynamicImage
                    source={cards[1]}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0.7,
                        transform: [{ scale: 0.95 }],
                        zIndex: 0,
                    }}
                />
            )}
            {cards.length > 0 && (
                <SwipeCard style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1,
                }}
                    onSwipeLeft={() => {
                        console.log('Swiped Left');
                        handleSwipe();
                    }}
                    onSwipeRight={() => {
                        console.log('Swiped Right');
                        handleSwipe();
                    }}
                >
                    <DynamicImage
                        source={cards[0]}
                        style={{
                            flex: 1,
                            backgroundColor: '#222', width: '100%', height: '100%'
                        }}
                    />
                </SwipeCard>
            )}
        </View>
    );
}