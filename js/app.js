var init = (function ($, ko, rootElement) {

	// NOTE: we support only firs 718 pokemons form childhood
	var MAX_POKEMON_COUNT = 718;
	var API_HOST = 'http://pokeapi.co/';

	function PokemonViewModel(pokemon) {
		var thisVM = this;
		var resourceUri = pokemon.resource_uri;
		var id = resourceUri.match(/(\d+)\/$/)[1];

		Object.defineProperty(thisVM, 'name', {
			get: function () {
				return pokemon.name;
			}
		});
		Object.defineProperty(thisVM, 'id', {
			get: function () {
				return id;
			}
		});

		Object.defineProperty(thisVM, 'img', {
			get: function () {
				return API_HOST + 'media/img/' + id + '.png';
			}
		});

		thisVM.loaded = ko.observable(false);

		thisVM.attack = ko.observable('');
		thisVM.defense = ko.observable('');
		thisVM.height = ko.observable('');
		thisVM.weight = ko.observable('');
		thisVM.hp = ko.observable('');
		thisVM.type = ko.observable('');

		this.loadData = function () {
			$.ajax({
				url: API_HOST + resourceUri,
				method: 'GET',
				type: 'json'
			})
				.success(function (data) {
					thisVM.attack(data.attack);
					thisVM.defense(data.defense);
					thisVM.height(data.height);
					thisVM.weight(data.weight);
					thisVM.hp(data.hp);
					thisVM.type(
						data.types
							.map(function (t) {
								return t.name;
							})
							.join('/'));
					
					thisVM.loaded(true);
				});
		}
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

		this.featchData = function () {
			thisVM.loading(true);
			$.ajax({
				url: API_HOST + 'api/v1/pokedex/1/',
				method: 'GET',
				type: 'json'
			})
				.success(function (data, textStatus, jqXHR) {

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

	// UI related logi here
	return function () {
		var $dialog = $('#pokemonInfo').modal({
			show: false
		});
		rootVM.featchData();
		$('.container').on('click', '.pokemon', function (event) {
			var pokemon = ko.dataFor(event.target);
			pokemon.loaded() || pokemon.loadData();
			var node = $dialog[0];
			ko.cleanNode(node);
			ko.applyBindings(pokemon, node);
			$dialog.modal('show');
		});
	};

})(jQuery, ko, document.getElementsByClassName('pokedex')[0]);

$(document).ready(init);