function DataClassBindingProvider() {
    var self = this;
    var dataClassBindingAttributeName = 'data-class';
    var dataClassBindingsPropertyName = 'bindings';
    var defaultBindingProvider = ko.bindingProvider['instance'];

    self.strictMode = true;
    self.previousBindingProvider = defaultBindingProvider;

    self.nodeHasBindings = function(node) {
        var hasDataClass = $(node).attr(dataClassBindingAttributeName) != undefined;
        var hasDataBind = defaultBindingProvider.nodeHasBindings(node);

        return hasDataClass || hasDataBind;
    };

    self.getBindings = function(node, bindingContext) {
        var dataBindBindings = defaultBindingProvider.getBindings(node, bindingContext) || {};
        var dataClass = $(node).attr(dataClassBindingAttributeName);
        var dataClassBindings = {};

        if (dataClass) {
            var $data = bindingContext['$data'];
            var bindings = $data[dataClassBindingsPropertyName];
            if (!bindings && self.strictMode) {
                throw new Error($data.constructor.name + " does not have a '" + dataClassBindingsPropertyName + "' property.");
            }

            dataClassBindings = bindings[dataClass];
            if (!dataClassBindings && self.strictMode) {
                throw new Error("Bindings for " + $data.constructor.name + " are missing an entry for data class '" + dataClass + "'.");
            }
        }

        ko.utils.extend(dataClassBindings, dataBindBindings);
        return dataClassBindings;
    };

    self.activate = function() {
        self.previousBindingProvider = ko.bindingProvider['instance'];
        ko.bindingProvider['instance'] = self;
    };

    self.deactivate = function() {
        ko.bindingProvider['instance'] = self.previousBindingProvider;
    };
}

(function() {
    var bindingProviders = {
        default: ko.bindingProvider['instance'],
        dataClassProvider: new DataClassBindingProvider
    };

    ko.exportSymbol('bindingProviders', bindingProviders);
})();