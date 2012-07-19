function ExampleViewModel() {
    var self = this;

    self.name = ko.observable('Stuart Childs');

    self.bindings = {
        exampleClass: {
            text: self.name
        }
    };
}

function ExampleCollectionViewModel() {
    var self = this;

    self.exampleElements = ko.observableArray();

    self.bindings = {
        exampleCollection: {
            template: {
                foreach: self.exampleElements
            }
        }
    };
}

describe("Example Usage", function() {
    var provider = ko.bindingProviders['dataClassProvider'];

    beforeEach(function() {
        provider.activate();
    });

    afterEach(function() {
        provider.deactivate();
    });

    it("should handle simple bindings", function() {
        affix('#node[data-class="exampleClass"]');

        var viewModel = new ExampleViewModel;
        ko.applyBindings(viewModel);

        expect($('#node').text()).toEqual('Stuart Childs');

        viewModel.name('Someone Else');

        expect($('#node').text()).toEqual('Someone Else');
    });

    it("should handle templates", function() {
        affix('#node[data-class="exampleCollection"] div[data-class="exampleClass"]');

        var viewModel = new ExampleCollectionViewModel;
        ko.applyBindings(viewModel);
        viewModel.exampleElements.push(new ExampleViewModel);
        viewModel.exampleElements.push(new ExampleViewModel);

        expect($('#node div').length).toEqual(2);
    });
});