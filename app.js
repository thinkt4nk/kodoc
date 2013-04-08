var chester = require('chester'),
	chunx   = require('chunx'),
	fs      = require('fs'),
	async   = require('async');


	
var default_workspace           = [__dirname, "workspace"].join('/'),
	options                     = { workspace: default_workspace },
	// widget header
	widget_header_regexp        = /\/\*\*((.|[\r\n])*)\*\/\s*(\r\n|\n)*\s*(.*)\.subclass\(['"]([\w\.]*)['"]\s*,\s*\{((.|[\r\n])*)\}\);/,
	// function header
	function_header_regexp      = /\/\*\*((.|[\r\n])*?)\*\/\s*(\r\n|\n)*\s*(.*?)\s*:\s*function/,
	// documentation
	documentation_markup_regexp = /(\*|[\r\n])/g,
	// @param type, name, and description
	function_param_regexp       = /@param\s+\{(.*?)\}\s+(\w+)\s+([^\r\n]+)/,
	// @return type an description
	function_return_regexp      = /@return\s+\{(.*?)\}\s+([^\r\n]+)/;

function run(options) {
	if (options.target == null) {
		error('Target not specified');
	}
	chester.enumerate(options.target, function(files) {
		files.forEach(function(file) {
			fs.readFile(file, 'utf-8', function(err, data) {
				if (!err) {
					var cx = new chunx(data);
					cx.find(widget_header_regexp, function(cx) {
						var widget_documentation  = cx[1].replace(documentation_markup_regexp, ' '),
							widget_parent         = cx[4],
							widget_name           = cx[5],
							widget_implementation = cx[6];
						console.log('# ', widget_name);
						console.log('- Functions');
						var implementation_cx = new chunx(widget_implementation);
						implementation_cx.find(function_header_regexp, function(cx) {
							var function_documentation = cx[1].replace(documentation_markup_regexp, ' '),
								function_name = cx[4];
							console.log("\t- ", markdown_escape(function_name));
						});
					});
				}
			});
		});
	});
}
function markdown_escape(content) {
	return content.replace(/_/gm, '\\_');
}
function usage() {
	// pass
}
function error(message) {
	console.log("ERROR: ", message);
	usage();
	process.exit(1);
}
process.argv.slice(2).forEach(function(arg) {
	var target_regexp    = /--target=/,
		workspace_regexp = /--workspace=/;
	if (target_regexp.test(arg)) {
		var target = arg.replace(target_regexp, ""),
			stats  = fs.statSync(target);
		if (stats.isFile() || stats.isDirectory()) {
			options.target = target;
		}
	}
	else if (workspace_regexp.test(arg)) {
		var workspace = arg.replace(workspace_regexp, ""),
			stats = fs.statSync(workspace);
		if (stats.isDirectory()) {
			options.workspace = workspace;
		}
		else {
			console.log('Warning: The workspace that you provided does not exist.  Falling back to ', default_workspace);
		}
	}
	else {
		error('Invalid argument, ', arg);
	}
});

// run the application
run(options);
