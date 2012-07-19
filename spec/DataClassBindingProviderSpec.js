describe("DataClassBindingProvider", function() {
    var provider;

    beforeEach(function() {
        provider = new DataClassBindingProvider();
    });

    describe("Bindings Detection", function() {
        it("should find bindings on nodes with the data-class attribute", function() {
            affix('#node[data-class="exampleClass"]');

            expect(provider.nodeHasBindings(nodeById('node'))).toBeTruthy();
        });

        it("should delegate to the built-in binding provider to find data-bind attributes", function() {
            affix('#node[data-bind="someBinding"]');

            expect(provider.nodeHasBindings(nodeById('node'))).toBeTruthy();
        });

        it("should not find bindings on nodes without the data-class attribute", function() {
            affix('#node');

            expect(provider.nodeHasBindings(nodeById('node'))).toBeFalsy();
        });
    });

    describe("Bindings Computation", function() {
        it("should get the bindings off of a binding context object", function() {
            affix('#node[data-class="exampleClass"]');

            var expectedBindings = {
                text: 'hello'
            };

            var viewModel = {
                bindings: {
                    exampleClass: expectedBindings
                }
            };

            var bindingContext = {
                $data: viewModel
            };

            var foundBindings = provider.getBindings(nodeById('node'), bindingContext);
            expect(foundBindings).toBe(expectedBindings);
        });

        it("should delegate to the built-in binding provider to get the bindings from a data-bind attribute", function() {
            affix('#node[data-bind="text: hello"]');

            var viewModel = {
                hello: ko.observable('hello')
            };

            var bindingContext = {
                $data: viewModel
            };

            var foundBindings = provider.getBindings(nodeById('node'), bindingContext);
            expect(foundBindings).not.toBeNull();
            expect(foundBindings.text).not.toBeNull();
        });

        it("should merge data-class and data-bind bindings, giving preference to data-bind", function() {
            affix('#node[data-class="exampleClass"][data-bind="text: hello"]');

            var viewModel = {
                hello: ko.observable('hello'),
                bindings: {
                    exampleClass: {
                        text: 'a string'
                    }
                }
            };

            var bindingContext = {
                $data: viewModel
            };

            var foundBindings = provider.getBindings(nodeById('node'), bindingContext);
            expect(foundBindings).not.toBeNull();
            expect(typeof foundBindings.text).toEqual('function');
        });

        it("should report a meaningful error if the view model does not have a bindings property", function() {
            affix('#node[data-class="exampleClass"]');

            function ExampleModel() {
            }

            var bindingContext = {
                $data: new ExampleModel
            };

            try {
                provider.getBindings(nodeById('node'), bindingContext);
            } catch (e) {
                expect(e.message).toEqual("ExampleModel does not have a 'bindings' property.");
            }
        });

        it("should report a meaningful error if the view model's bindings are missing an entry for a class", function() {
            affix('#node[data-class="exampleClass"]');

            function ExampleModel() {
                this.bindings = {}
            }

            var bindingContext = {
                $data: new ExampleModel
            };

            try {
                provider.getBindings(nodeById('node'), bindingContext);
            } catch (e) {
                expect(e.message).toEqual("Bindings for ExampleModel are missing an entry for data class 'exampleClass'.");
            }
        });
    });

    describe("Installation", function() {
        it("should install itself into the ko namespace", function() {
            expect(ko.bindingProviders).not.toBeUndefined();
            expect(ko.bindingProviders['default']).not.toBeUndefined();
            expect(ko.bindingProviders['dataClassProvider']).not.toBeUndefined();
        });
    });

    describe("Activation", function() {
        it("should set the KO binding provider to be itself", function() {
            provider.activate();

            expect(ko.bindingProvider['instance']).toBe(provider);
        });

        it("should keep a reference to the previous provider when activated", function() {
            var dummyProvider = {};

            ko.bindingProvider['instance'] = dummyProvider;

            provider.activate();

            expect(provider.previousBindingProvider).toBe(dummyProvider);
        });

        it("should restore the previous binding provider when deactivated", function() {
            var dummyProvider = {};

            ko.bindingProvider['instance'] = dummyProvider;

            provider.activate();
            provider.deactivate();

            expect(ko.bindingProvider['instance']).toBe(dummyProvider);
        });
    });

    function nodeById(nodeId) {
        return document.getElementById(nodeId);
    }
});