// Functions to manipulate LocalStorage
const setMealToLS = (mealId) => {
  const favMeals = getMealsFromLS();
  localStorage.setItem("favMeals", JSON.stringify([...favMeals, mealId]));
};

const getMealsFromLS = () => {
  const allMeals = localStorage.getItem("favMeals");
  return allMeals ? JSON.parse(allMeals) : [];
};

const removeMealFromLS = (mealId) => {
  const allMeals = getMealsFromLS();
  localStorage.setItem(
    "favMeals",
    JSON.stringify(
      allMeals.filter((id) => {
        return id !== mealId;
      })
    )
  );
};

// Add functionality of "Add to favourte" button
const addToFav = () => {
  const favBtns = document.querySelectorAll(".fav-btn");
  favBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (btn.getAttribute("active") === "true") {
        btn.innerHTML = `<i class="far fa-2x fa-heart"></i>`;
        btn.removeAttribute("active");
        window.location.reload();
        removeMealFromLS(e.target.dataset.id);
      } else {
        btn.setAttribute("active", "true");
        btn.innerHTML = `<i class="fas fa-2x fa-heart"></i>`;
        setMealToLS(e.target.dataset.id);
        window.location.reload();
      }
    });
  });
};

// Render a random meal
const randomMealContainer = document.querySelector("#random-meal");

const getRandomMeal = async () => {
  try {
    const request = await fetch(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const response = await request.json();
    const randomMeal = response.meals[0];
    return randomMeal;
  } catch (error) {
    console.log(error);
  }
};

const showRandomMeal = async () => {
  try {
    const randomMeal = await getRandomMeal();
    const allFavMeals = getMealsFromLS();
    if (allFavMeals.includes(String(randomMeal.idMeal))) {
      randomMealContainer.innerHTML = `
          <span class="random-meal">Top Trending</span>
          <div class="meal-header">
            <img
              src="${randomMeal.strMealThumb}"
              alt=""
            />
          </div>
          <div class="meal-body">
            <h4 data-id="${randomMeal.idMeal}">${randomMeal.strMeal}</h4>
            <button class="fav-btn" active="true">
              <i class="fas fa-2x fa-heart" data-id="${randomMeal.idMeal}"></i>
            </button>
          </div>
          `;
    } else {
      randomMealContainer.innerHTML = `
      <span class="random-meal">Top Trending</span>
      <div class="meal-header">
        <img
          src="${randomMeal.strMealThumb}"
          alt=""
        />
      </div>
      <div class="meal-body">
        <h4 data-id="${randomMeal.idMeal}">${randomMeal.strMeal}</h4>
        <button class="fav-btn">
          <i class="far fa-2x fa-heart" data-id="${randomMeal.idMeal}"></i>
        </button>
      </div>
      `;
    }
    addToFav();
    const recipeTitle = document.querySelector("h4[data-id]");
    recipeTitle.addEventListener("click", showDetailsOfMeal);
  } catch (error) {
    console.log(error);
  }
};

showRandomMeal();

// Render items in favourites list container

const getMealById = async (mealId) => {
  try {
    const request = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const response = await request.json();
    return response;
  } catch (error) {
    console.log(error);
  }
};

// Deleting meals from fav container
const deleteMealFromFav = (e) => {
  const mealId = e.target.dataset.id;
  removeMealFromLS(mealId);
  window.location.reload();
};

const favsList = document.querySelector("#favs-list");
const showFavMeals = async (mealsArr) => {
  try {
    if (mealsArr.length === 0) {
      favsList.innerHTML = `<span style="color: rgba(0, 0, 0, 0.4)">+ Add meals to show up here</span>`;
    } else {
      const requests = await Promise.all(mealsArr);
      requests.forEach((meal) => {
        favsList.innerHTML += `
        <li>
          <img 
          src="${meal.meals[0].strMealThumb}"
          alt=""
          data-id="${meal.meals[0].idMeal}"
          />
          <span class="tooltip hide">${meal.meals[0].strMeal}</span>
        <i class="fas fa-times hide" data-id="${meal.meals[0].idMeal}"></i>
          </li> 
        `;
      });

      // Add delete from fav functionality

      const deleteIcons = document.querySelectorAll("#favs-list li .fa-times");
      deleteIcons.forEach((icon) => {
        icon.addEventListener("click", deleteMealFromFav);
      });

      const favMealsImgs = document.querySelectorAll("img[data-id]");
      favMealsImgs.forEach((img) => {
        img.addEventListener("click", showDetailsOfMeal);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

if (getMealsFromLS()) {
  const favMeals = getMealsFromLS();
  const apiCalls = [];
  favMeals.forEach((id) => {
    apiCalls.push(getMealById(id));
  });
  showFavMeals(apiCalls);
}

// Show all matching meals on search
const getMealBySearch = async (query) => {
  try {
    const request = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );
    const response = await request.json();
    return response.meals ? response.meals.slice(0, 5) : [];
  } catch (error) {
    console.log(error);
  }
};

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#query");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const searchQuery = searchInput.value;
    const searchedMeals = await getMealBySearch(searchQuery);
    if (searchedMeals.length === 0) {
      document.querySelector("section").innerHTML = `
        <div class="search-container">
        <h1 style="color: red;">Invalid keywords!</h1>
        </div>
        `;
    } else {
      document.querySelector("section").innerHTML = `
      <div class="search-container">
      <h1>Search results for "${searchQuery}"</h1>
        <div class="search-items"></div>
      </div>
    `;

      searchedMeals.forEach((meal) => {
        const allFavMeals = getMealsFromLS();
        if (allFavMeals.includes(String(meal.idMeal))) {
          document.querySelector(".search-items").innerHTML += `
          <div class="item">
            <img src="${meal.strMealThumb}" alt="" />
            <h4 data-id="${meal.idMeal}">${meal.strMeal}</h4>
            <button class="fav-btn" active="true">
            <i class="fas fa-2x fa-heart" data-id="${meal.idMeal}"></i>
          </button>
          </div> 
      `;
        } else {
          document.querySelector(".search-items").innerHTML += `
          <div class="item">
            <img src="${meal.strMealThumb}" alt="" />
            <h4 data-id="${meal.idMeal}">${meal.strMeal}</h4>
            <button class="fav-btn">
            <i class="far fa-2x fa-heart" data-id="${meal.idMeal}"></i>
          </button>
          </div> 
      `;
        }
      });
      addToFav();
      const recipeTitles = document.querySelectorAll("h4[data-id]");
      recipeTitles.forEach((title) => {
        title.addEventListener("click", showDetailsOfMeal);
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Show popup for recipe details
const popupContainer = document.querySelector("#popup");
const popupContent = document.querySelector(".popup-content");

const renderRecipeDetails = (mealDetails) => {
  popupContent.innerHTML = `
    <h1>${mealDetails.strMeal}</h1>
    <span>Category: ${mealDetails.strCategory}</span> |
    <span>Area: ${mealDetails.strArea}</span>
    <h3>Instructions:</h3>
    <p>"<i>${mealDetails.strInstructions}</i>"</p>
  `;

  // Closing details popup container
  const closePopupIcon = document.querySelector("#popup .fa-times");
  closePopupIcon.addEventListener("click", () => {
    popupContainer.style.transform = "scale(0)";
  });
};

const showDetailsOfMeal = async (e) => {
  try {
    const mealId = e.target.dataset.id;
    const fetchMealDetails = await getMealById(mealId);
    popupContainer.style.transform = "scale(1)";
    renderRecipeDetails(fetchMealDetails.meals[0]);
  } catch (error) {
    console.log(error);
  }
};
