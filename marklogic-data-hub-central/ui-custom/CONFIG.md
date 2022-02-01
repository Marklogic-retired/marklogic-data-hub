# Twizzlers-UI Configuration

*NOTE: All configuration is subject to change as the backend API is defined and global functionality is moved into React Context (which will preclude the need for passing in certain component props).*

## Application Views

The application has three views handled by corresponding React component files:

- Dashboard (`src/views/Dashboard.tsx`)
- Results (`src/views/Results.tsx`)
- Detail (`src/views/Detail.tsx`)

To change content in the views, edit the JSX (which is similar to HTML) in the component's `return` value.

## Application Components

Functionality in the views is achieved with React components in the `src/components` directory. Components are defined in the views with bracket and attribute notation (similar to HTML), for example:

```
<Search data={saved} config={configDashboard} handleSearch={props.handleSearch} />
```

Most components have a `data` attribute (for passing in dynamic data) and a `config` attribute (for passing in configuration information). 

To change how the components behave, you can change their corresponding configuration information (in the `config` directory).

A special `Section` wrapper component lets you enclose one or more child components in a bordered, titled container. For example:

```
<Section title="Search">
    <Search data={saved} config={configDashboard} handleSearch={props.handleSearch} />
</Section>
```

## Application Styling

Some basic styling can be controlled with configuration properties (for example, the color of `Metric` containers).

You can also change styling by editing the correspoding `.scss` files for the views or components. 
