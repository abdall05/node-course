module.exports = (template, data) =>
  template.replace(/{{(\w+)}}/g, (_, key) => data[key] ?? "");
