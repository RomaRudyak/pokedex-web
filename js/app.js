var loadData = (function ($, ko, rootElement) {

	// NOTE: we support only firs 718 pokemons form childhood
	var MAX_POKEMON_COUNT = 718;

	function PokemonViewModel(pokemon) {
		var resourceUri = pokemon.resource_uri;
		var id = resourceUri.match(/(\d+)\/$/)[1];

		this.name = pokemon.name;
		this.id = id
		this.img = 'http://pokeapi.co/media/img/' + id + '.png';
	}

	function PokedexViewModel() {
		var thisVM = this;
		this.pokemons = ko.observableArray();
		this.loading = ko.observable(false);
		this.search = ko.observable('');

		this.filterdPokemons = ko.computed(function () {
			var search = thisVM.search().toUpperCase();
			if (!search) {
				return thisVM.pokemons();
			}
			return thisVM.pokemons().filter(function (el) {
				return el.name.toUpperCase().indexOf(search) != -1;
			})
		});

		this.init = function () {
			thisVM.loading(true);
			$.ajax({
				url: 'http://pokeapi.co/api/v1/pokedex/1/',
				method: 'GET',
				type: 'json'
			})
				.done(function (data, textStatus, jqXHR) {

					var viewModels = data.pokemon
						.map(function (p) {
							return new PokemonViewModel(p);
						})
						.sort(function (p1, p2) {
							return p1.id - p2.id;
						});

					if (viewModels.length > MAX_POKEMON_COUNT) {
						viewModels.length = MAX_POKEMON_COUNT;
					}
					
					thisVM.pokemons(viewModels);
					thisVM.loading(false);
				});
		}
	}



	var rootVM = new PokedexViewModel()
	ko.applyBindings(rootVM, rootElement);

	return rootVM.init;
})(jQuery, ko, document.body);

$(document).ready(loadData);