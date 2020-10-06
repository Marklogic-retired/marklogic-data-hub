import Background from '../assets/background-fast-lines.jpg';

// Page themes
let themes = {
    image: {
        background: {
            backgroundImage: `url("${Background}")`,
            width: '100%',
            height: '100%',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        },
        footer: {
            color: '#fff'
        },
        footerLink: {
            color: '#fff'
        },
        bodyBg: 'bgColorImage'
    },
    white: {
        background: {
            backgroundColor: '#fff',
            width: '100%',
            height: '100%',
            bottom: '0px'
        },
        footer: {
            color: '#999'
        },
        footerLink: {
            color: '#44499c'
        },
        bodyBg: 'bgColorWhite'
    }
};

// Default theme if none mapped to pathname
themes['default'] = themes['white'];

// Pathnames mapped to themes
const themeMap = {
    '/':         'image',
    '/install':  'image'
};

export {
    themes,
    themeMap
};
