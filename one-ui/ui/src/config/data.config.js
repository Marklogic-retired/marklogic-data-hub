// Test data

const flows = [
    { 
        name: 'FlowA',
        steps: [
            { 
                name: 'stepA1',
                type: 'Load Data',
                format: 'JSON'
            },
            { 
                name: 'stepA2',
                type: 'Mapping',
                format: 'JSON'
            }
        ]
    },
    { 
        name: 'FlowB',
        steps: [
            { 
                name: 'stepB1',
                type: 'Load Data',
                format: 'XML'
            },
            { 
                name: 'stepB2',
                type: 'Mapping',
                format: 'XML'
            },
            { 
                name: 'stepB3',
                type: 'Mastering',
                format: 'XML'
            },
        ]
    }
]

const data = {
    flows: flows
}

export default data;