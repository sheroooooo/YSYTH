import PlgDocWrapper from './plg-doc-wrapper'
const components = {
  PlgDocWrapper
}

export default (Vue) => {
  Object.keys(components).map(key => {
    const component = components[key]
    Vue.component(component.name, component)
  })
}
