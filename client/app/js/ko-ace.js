define(["knockout", "ace/ace"], function(ko, ace){

	var editorStore = {};

	ko.bindingHandlers.ace = {
		init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var obj = ko.utils.unwrapObservable(valueAccessor());
			var text = ko.utils.unwrapObservable(obj.text);
			var skin = ko.utils.unwrapObservable(obj.skin);
			var octfile = ko.utils.unwrapObservable(obj.octfile);

			// Make the editor
			var editor = ace.edit(element.id);
			editor.setTheme(skin.aceTheme);
			editor.getSession().setMode("ace/mode/octave");
			editor.setValue(text);
			editor.gotoLine(0);
			editor.commands.addCommand({
				name: 'save',
				bindKey: { mac: 'Command-S', win: 'Ctrl-S' },
				exec: octfile.save,
				readOnly: false
			});
			editor.setOptions({ enableBasicAutocompletion: true });
			editor.focus();

			// Bind to Knockout changes
			var onAceChange = function(delta){
				var _obj = valueAccessor();
				if (ko.isWriteableObservable(_obj.text)) {
					_obj.text(editor.getValue());
				}
			};
			editor.getSession().on("change", onAceChange);

			// Attach OT to the editor instance
			var otClient = octfile.getOtClient();
			if (otClient) otClient.attachEditor(editor);

			// Save reference
			if (bindingContext.editor) {
				console.log("WARNING: bindingContext.editor already set");
			}
			bindingContext.editor = editor;

			// Destroy Handler
			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
				editor.getSession().off("change", onAceChange);
				if (otClient) otClient.attachEditor(null);
				delete bindingContext.editor;
				editor.destroy();
			});
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var obj = ko.utils.unwrapObservable(valueAccessor());
			var text = ko.utils.unwrapObservable(obj.text);
			var skin = ko.utils.unwrapObservable(obj.skin);
			var octfile = ko.utils.unwrapObservable(obj.octfile);
			var editor = bindingContext.editor;

			if(editor.getValue() !== text){
				editor.setValue(text);
				editor.gotoLine(0);
			}

			if(editor.getTheme() !== skin.aceTheme){
				editor.setTheme(skin.aceTheme);
			}
		}
	}
})