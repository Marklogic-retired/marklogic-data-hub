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

// Color scheme for use in typescript files
const themeColors = {
    "primary": "#394494",
    "secondary": "#993366",
    "success": "#389e0d",
    "info": "#5b69af",
    "warning": "#ce8406",
    "danger": "#b32424",
    "light": "#cccc",
    "dark": "#343a40",
    "text-color-secondary": "#777777",

    "defaults": {
        "entityColor": "#eeeff1",
        "questionCircle": "#7f86b5",
        "conceptColor": "#FFFFFF"
    },

    "facetIndicator": {
        active: "#1acca8",
        inactive: "#dddddd"
    }
}

// Default theme if none mapped to pathname
themes['default'] = themes['white'];

// Pathnames mapped to themes
const themeMap = {
    '/':         'image',
    '/install':  'image'
};

export {
    themes,
    themeMap,
    themeColors
};
