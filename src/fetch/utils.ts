/* eslint-disable no-prototype-builtins */
/**
 * 获取数据类型
 * @example typer(null) // => 'null'
 * @param {unknown} value 需要获取类型的数据
 */
export function typer (value:unknown) :string {
  const type = Object.prototype.toString.call(value)
  return type.slice(8, -1).toLowerCase()
}

/**
 * 包含关系
 * @param {unknown} obj 数据源
 * @param {unknown} values 判断目标
 * @param {string} key obj为对象数组用
 */
export function has (obj:any, values:any, key = '') {
  const valueType = typer(values)

  switch (typer(obj)) {
    case 'object':
      return valueType === 'string'
        ? obj.hasOwnProperty(values)
        : values.some((o: unknown) => obj.hasOwnProperty(o))
    case 'array':
      if (key) {
        return obj.some((o: { [x: string]: unknown }) => valueType === 'array'
          ? has(values, o[key])
          : o[key] === values
        )
      } else {
        return valueType === 'array'
          ? values.some((o: unknown) => obj.includes(o))
          : obj.includes(values)
      }
    case 'string':
      return valueType === 'array'
        ? values.some((o: unknown) => obj.includes(o))
        : obj.includes(values)
    default:
      return false
  }
}
