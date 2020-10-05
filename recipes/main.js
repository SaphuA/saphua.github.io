window.addEventListener("load", function () {
  Vue.use(VueRouter);

  var router = new VueRouter({
    routes: [{ path: "/:groupId" }],
  });

  new Vue({
    directives: {
      tooltip: tooltip,
    },
    router: router,
    components: {
      Toolbar: toolbar,
      Slider: slider,
      Dropdown: dropdown,
      Dialog2: dialog,
      Button2: button,
      Dataview: dataview,
    },
    el: "#app",
    data: {
      pv: "",
      ac: false,
      localImages: false,
      favorites: JSON.parse(window.localStorage.getItem("favorites") || "[]"),

      hfCuisinesNormalized: _hfCuisinesNormalized,
      hfIngredientsNormalized: _hfIngredientsNormalized,
      hfRecipeVersions: _hfRecipeVersions,
      hfTagsNormalized: _hfTagsNormalized,

      prepTimesMin: 0,
      prepTimesMax: 140,
      selectedPrepTimesRange: [0, 140],

      complexityMin: 0,
      complexityMax: 3,
      selectedComplexities: [0, 3],

      selectedCuisine: null,
      selectedTag: null,
      selectedIngredient: null,

      onlyFavorites: false,

      selectedRecipeVersions: null,
      selectedRecipeIndex: 0,
      selectedYield: 1,
    },
    methods: {
      ps: function () {
        if (btoa(this.pv) == "YXBwZWx0YWFydA==") {
          this.ac = true;
        }
      },
      navigateToRecipe: function (recipe) {
        router.push({ query: { groupId: recipe.groupId } });
      },
      closeModal: function () {
        router.push({ query: null });
      },
      selectRecipeVersions: function (recipeVersions) {
        this.selectedRecipeVersions = recipeVersions;
        this.selectedRecipeIndex = 0;
        this.selectedYield = recipeVersions[0].yields[0].yields;
      },
      selectRecipeVersionIndex: function (index) {
        if (!this.hasYield(this.selectedRecipeVersions[index], this.selectedYield)) {
          this.selectedYield = this.selectedRecipeVersions[index].yields[0].yields;
        }
        this.selectedRecipeIndex = index;
      },
      selectYield: function (yield) {
        this.selectedYield = yield;
      },
      hasYield: function (recipe, yield) {
        if (!recipe.yields) return false;

        for (var i = 0; i < recipe.yields.length; i++) {
          if (recipe.yields[i].yields == yield) {
            return true;
          }
        }

        return false;
      },
      getYield: function (recipe, ingredient, yield) {
        if (!recipe.yields) return null;

        for (var i = 0; i < recipe.yields.length; i++) {
          if (recipe.yields[i].yields == yield) {
            for (var j = 0; j < recipe.yields[i].ingredients.length; j++) {
              if (recipe.yields[i].ingredients[j].id == ingredient) {
                return recipe.yields[i].ingredients[j];
              }
            }
          }
        }

        return null;
      },
      toggleFavorite: function (recipe) {
        if (this.favorites.includes(recipe.groupId)) {
          this.favorites = this.favorites.filter((f) => f != recipe.groupId);
        } else {
          this.favorites.push(recipe.groupId);
        }

        window.localStorage.setItem("favorites", JSON.stringify(this.favorites));
      },
    },
    computed: {
      selectedRecipe: function () {
        if (!this.selectedRecipeVersions) return null;
        return this.selectedRecipeVersions[this.selectedRecipeIndex];
      },
      hfCuisines: function () {
        return Object.keys(this.hfCuisinesNormalized).map((key) => this.hfCuisinesNormalized[key]);
      },
      hfIngredients: function () {
        return Object.keys(this.hfIngredientsNormalized).map((key) => this.hfIngredientsNormalized[key]);
      },
      hfRecipeVersionsFiltered: function () {
        return this.hfRecipeVersions
          .map((v) =>
            v.filter(
              (r) =>
                r.prepTimeMinutes >= this.selectedPrepTimesRange[0] &&
                r.prepTimeMinutes <= this.selectedPrepTimesRange[1] &&
                r.difficulty >= this.selectedComplexities[0] &&
                r.difficulty <= this.selectedComplexities[1] &&
                (this.selectedCuisine == null || r.cuisines.some((c) => c.id === this.selectedCuisine.id)) &&
                (this.selectedTag == null || r.tags.some((c) => c.id === this.selectedTag.id)) &&
                (this.selectedIngredient == null || r.ingredients.some((c) => c.id === this.selectedIngredient.id)) &&
                (!this.onlyFavorites || this.favorites.some((f) => f === r.groupId))
              //(this.selectedCuisines.length === 0 || (r.cuisines && this.selectedCuisines.every((c) => r.cuisines.some((s) => s.id === c.id)))) &&
              //(this.selectedTags.length === 0 || (r.tags && this.selectedTags.every((c) => r.tags.some((s) => s.id === c.id)))) &&
              //(this.selectedIngredients.length === 0 || (r.ingredients && this.selectedIngredients.every((c) => r.ingredients.some((s) => s.id === c.id))))
            )
          )
          .filter((v) => v && v.length > 0);
      },
      hfTags: function () {
        return Object.keys(this.hfTagsNormalized).map((key) => this.hfTagsNormalized[key]);
      },
    },
    watch: {
      $route: {
        immediate: true,
        handler(to) {
          if (to.query && to.query.groupId) {
            this.selectedRecipeVersions = this.hfRecipeVersions.find((c) => c[0].groupId == to.query.groupId);
            this.selectedRecipeIndex = 0;
            this.selectedYield = this.selectedRecipeVersions[0].yields[0].yields;
          } else {
            this.selectedRecipeVersions = null;
            this.selectedRecipeIndex = 0;
            this.selectedYield = 1;
          }
        },
      },
    },
  });
  Vue.config.devtools = true;
});
