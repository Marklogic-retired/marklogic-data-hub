const searchboxConfig  = {  

    // Application searchbox
    searchbox: {
        items: [
            {
                label: "All Entities",
                value: ["person", "organization", "thing"],
                default: true
            },
            {
                label: "Person",
                value: "person"
            },
            {
                label: "Organization",
                value: "organization"
            },
            {
                label: "Thing",
                value: "thing"
            }
        ]
    }
};

module.exports = searchboxConfig;
