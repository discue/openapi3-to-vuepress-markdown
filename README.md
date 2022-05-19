
<p align="center"><a href="https://www.discue.io/" target="_blank" rel="noopener noreferrer"><img width="128" src="https://www.discue.io/icons-fire-no-badge-square/web/icon-192.png" alt="Vue logo"></a></p>

# openapi3-to-vuepress-markdown
An OpenApi3 to Markdown converter targeting [VuePress v2](ttps://github.com/vuepress/vuepress-next) compatible Markdown. This is heavily based on [Widdershins](https://github.com/Mermade/widdershins) with the unrelevant code being stripped and [VuePress v2](https://github.com/vuepress/vuepress-next) Components like [Badge](https://v2.vuepress.vuejs.org/reference/default-theme/components.html#badge) being added.

### News

* Version 4.0 changes:
  * Now uses Promises not callbacks
  * Option to output html directly, and to ReSpec format
  * Unified JavaScript and Node.js code-samples, PHP added
  * `restrictions` column (`readOnly`/`writeOnly`) added to schema templates
  * Numerous bug fixes
* As of v3.0.0 Widdershins no longer expands the definition of OpenAPI body parameters / requestBodies by default, unless they have an inline schema. You can restore the old behaviour by using the `--expandBody` option.
* You may limit the depth of schema examples using the `--maxDepth` option. The default is 10.
* To omit schemas entirely, please copy and customise the `main.dot` template.
* As of v3.1.0 Widdershins includes a generated `Authorization` header in OpenAPI code samples. If you wish to omit this, see [here](/templates/openapi3/README.md).

### To install

* Clone the git repository, and `npm i` to install dependencies, or

### Getting started

Widdershins is generally used as a stage in an API documentation pipeline. The pipeline begins with an API definition in OpenAPI 3.x, OpenAPI 2.0 (fka Swagger), API Blueprint, AsyncAPI or Semoasa format. Widdershins converts this description into markdown suitable for use by a **renderer**, such as [Slate](https://github.com/slatedocs/slate), [ReSlate](https://github.com/mermade/reslate), [Shins](https://github.com/mermade/shins)  (*deprecated*) or html suitable for use with [ReSpec](https://github.com/w3c/respec).

If you need to create your input API definition, [this list of available editors](https://apis.guru/awesome-openapi3/category.html#editors) may be useful.

More in-depth documentation is [available here](https://mermade.github.io/widdershins).

### Examples

```
node widdershins --search false --language_tabs 'ruby:Ruby' 'python:Python' --summary defs/petstore3.json -o petstore3.md
```

### Options

| CLI parameter name | JavaScript parameter name | Type | Default value | Description |
| --- | --- | --- | --- | --- |
| --summary | options.tocSummary | `boolean` | `false` | Use the operation summary as the TOC entry instead of the ID. |
| --useBodyName | options.useBodyName | `boolean` | Use original param name for OpenAPI 2.0 body parameter. |
| -h, --help | options.help | `boolean` | `false` | Show help. |
| --version | options.version | `boolean` | `false` | Show version number. |
| -d, --discovery | options.discovery | `boolean` | `false` | Include schema.org WebAPI discovery data. |
| -e, --environment | N/A | `string` | None | File to load config options from. |
| -i, --includes | options.includes | `string` | None | List of files to put in the `include` header of the output Markdown. Processors such as Shins can then import the contents of these files. |
| -l, --lang | options.lang | `boolean` | `false` | Generate the list of languages for code samples based on the languages used in the source file's `x-code-samples` examples. |
| -o, --outfile | N/A | `string` | None | File to write the output markdown to. If left blank, Widdershins sends the output to stdout. 
| -u, --user_templates | options.user_templates | `string` | None | Directory to load override templates from. |
| -x, --experimental | options.experimental | `boolean` |  | Use httpSnippet for multipart mediatypes. |
|  | options.toc_footers | `object` | A map of `url`s and `description`s to be added to the ToC footers array (JavaScript code only). |

The `--environment` option specifies a JSON or YAML-formatted `options` object, for example:

```json
{
  "language_tabs": [{ "go": "Go" }, { "http": "HTTP" }, { "javascript": "JavaScript" }, { "javascript--node": "Node.JS" }, { "python": "Python" }, { "ruby": "Ruby" }],
  "tagGroups": [
    {
      "title": "Companies",
      "tags": ["companies"]
    },
    {
      "title": "Billing",
      "tags": ["invoice-create", "invoice-close", "invoice-delete"]
    }
  ]
}
```


Schema.org WebAPI discovery data is included if the `discovery` option above is set `true`. See the W3C [WebAPI Discovery Community Group](https://www.w3.org/community/web-api-discovery/) for more information.

## Templates

By default, Widdershins uses the templates in its `templates/` folder to generate the Markdown output. To customize the templates, copy some or all of them to a folder and pass their location to the `user_templates` parameter.

The templates include `.dot` templates and `.def` partials. To override a `.dot` template, you must copy it and the child `.def` partials that the template references. Similarly, to override a `.def` partial, you must also copy the parent `.dot` template. For OpenAPI 3, the primary template is `main.dot` and its main child partials are `parameters.def`, `responses.def`, and `callbacks.def`.

This means that it is usually easiest to copy all `.dot` and `.def` files to your user templates directory so you don't skip a template or partial. To bring in changes from Widdershins updates, you can use a visual `diff` tool which can run across two directories, such as [Meld](http://meldmerge.org/) or [WinMerge](http://winmerge.org).

### Template syntax

Templates are compiled with [doT.js](https://github.com/olado/doT#readme).

Templates have access to a `data` object with a range of properties based on the document context. For information about the parameters, see the README file for the appropriate templates:

* [Swagger 2.0 / OpenAPI 3.0.x template parameters](/templates/openapi3/README.md)

To print the value of a parameter or variable in a template, use the code `{{=parameterName}}`. For example, to print the title of an OpenAPI 3 spec (from its `info.title` field), use the code `{{=data.api.info.title}}`.

To loop through values in an array, use the code `{{~ arrayName :tempVariable}}` to start the loop and the code `{{~}}` to close the loop. For example, the OpenAPI 3 partial `parameters.def` uses this code to create a table of the parameters in an operation:
```
|Name|In|Type|Required|Description|
|---|---|---|---|---|
{{~ data.parameters :p}}|{{=p.name}}|{{=p.in}}|{{=p.safeType}}|{{=p.required}}|{{=p.shortDesc || 'none'}}|
{{~}}
```

For if/then logic, use the code `{{? booleanExpression}}` to start the code block and the code `{{?}}` to close the block. For example, the OpenAPI 3 `main.dot` template calls the `security.def` partial to show information about the security schemes if the OpenAPI spec includes a `securitySchemes` section:
```
{{? data.api.components && data.api.components.securitySchemes }}
{{#def.security}}
{{?}}
```

You can run arbitrary JavaScript within a template by inserting a code block within curly braces. For example, this code creates a variable and references it with normal doT.js syntax later in the template:
```
{{ {
let message = "Hello!";
} }}

{{=message}}
```