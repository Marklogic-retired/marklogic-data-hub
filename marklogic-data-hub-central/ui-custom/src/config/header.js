export const configHeader = { 
    title: "Twizzlers-UI",
    menus: [
        {
            label: "Search",
            to: "/search"
        },
        {
            label: "ML Home",
            url: "http://www.marklogic.com"
        },
        {
            label: "Submenu",
            submenu: [
                {
                    label: "ML Docs",
                    url: "https://docs.marklogic.com/"
                },
                {
                    label: "Search",
                    to: "/search"
                }
            ]
        }
    ]
};