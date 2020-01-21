import Background from '../components/assets/Color_Large_Banner.jpg';

// Page themes
let themes = {
    image: { 
        background: {
            backgroundImage: `url("${Background}")`,
            width: '100%',
            height: '100%',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            bottom: '0px' 
        },
        footer: {
            color: '#fff'
        },
        footerLink: {
            color: '#fff'
        }
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
        }
    }
}

// Default theme if none mapped to pathname
themes['default'] = themes['white'];

// Pathnames mapped to themes
const themeMap = {
    '/':         'image',
    '/install':  'image'
}

export {
    themes,
    themeMap
}