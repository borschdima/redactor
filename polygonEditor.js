document.addEventListener("DOMContentLoaded", () => {
	const btnCreate = document.querySelector("#createPoligone");
	const btnSend = document.querySelector("#sendtoDB");
	const list = document.querySelector(".list");
	const districtName = document.querySelector("#districtName");
	const error = document.querySelector(".validation-error");

	const myMap = ymaps.ready(init);

	function init() {
		const myMap = new ymaps.Map(
			"map",
			{
				center: [48.015884, 37.802849],
				zoom: 13,
				controls: ["zoomControl", "searchControl"],
				behaviors: ["drag"]
			},
			{
				searchControlProvider: "yandex#search"
			}
		);

		// Обработчик нажатия на кнопку выгрузки данных
		btnSend.addEventListener("click", () => {
			let data = [];

			// Береме все полигоны и формируем массив данных
			myMap.geoObjects.each(geoObject => {
				const coordinates = geoObject.geometry.getCoordinates();
				const name = geoObject.options.get("name");
				if (coordinates[0].length !== 0) {
					data.push({ name, coordinates: coordinates[0] });
				}
			});
			if (data.length > 0) {
				const jsonData = JSON.stringify(data);
				downloadFile("data:text/json;charset=utf-8," + jsonData, "Result.json");
			}
		});

		// Обработчик нажатия на кнопку создания полигона
		btnCreate.addEventListener("click", () => {
			if (districtName.value === "") {
				error.style.display = "block";
			} else {
				// Создаем многоугольник без вершин.
				const myPolygon = new ymaps.Polygon(
					[],
					{},
					{
						// Курсор в режиме добавления новых вершин.
						editorDrawingCursor: "crosshair",
						// Максимально допустимое количество вершин.
						editorMaxPoints: 300,
						// Цвет заливки.
						fillColor: "#00FF00",
						opacity: 0.3,
						// Цвет обводки.
						strokeColor: "#0000FF",
						// Ширина обводки.
						strokeWidth: 2,
						name: "Haha"
					}
				);
				// Добавляем многоугольник на карту.
				myMap.geoObjects.add(myPolygon);

				// В режиме добавления новых вершин меняем цвет обводки многоугольника.
				var stateMonitor = new ymaps.Monitor(myPolygon.editor.state);
				stateMonitor.add("drawing", function(newValue) {
					myPolygon.options.set("strokeColor", newValue ? "#FF0000" : "#0000FF");
				});

				// Включаем режим редактирования с возможностью добавления новых вершин.
				myPolygon.editor.startDrawing();

				myPolygon.events.add("editorstatechange", () => {
					const drawing = myPolygon.editor.state.get("drawing");
					const editing = myPolygon.editor.state.get("editing");

					if (!drawing && editing) {
						list.insertAdjacentHTML("beforeend", `<li class="list__item">${districtName.value}<span class="remove">&times;</span></li>`);
						myPolygon.options.set("name", districtName.value);
						districtName.value = "";
					}
				});
			}
		});

		// Убираем ошибку ввода при наборе имени района
		districtName.addEventListener("input", () => {
			error.style.display = "none";
		});

		// Удаление соответствующего олигона
		list.addEventListener("click", e => {
			const target = e.target;
			const targetClass = target.classList;

			if (targetClass.contains("remove")) {
				const poligoneName = target.parentElement.childNodes[0].data;
				target.parentElement.remove();
				myMap.geoObjects.each(geoObject => {
					if (geoObject.options.get("name") === poligoneName) myMap.geoObjects.remove(geoObject);
				});
			}
		});

		// Выделение соответствующего полигона при наведении на название района в списке
		list.addEventListener("mouseover", e => {
			const target = e.target;
			const targetClass = target.classList;

			if (targetClass.contains("list__item")) {
				const poligoneName = target.childNodes[0].data;
				myMap.geoObjects.each(geoObject => {
					if (geoObject.options.get("name") === poligoneName) geoObject.options.set("fillColor", "#f1755f");
				});
			}
		});

		// Выделение соответствующего полигона при наведении на название района в списке
		list.addEventListener("mouseout", e => {
			const target = e.target;
			const targetClass = target.classList;

			if (targetClass.contains("list__item")) {
				const poligoneName = target.childNodes[0].data;
				myMap.geoObjects.each(geoObject => {
					if (geoObject.options.get("name") === poligoneName) geoObject.options.set("fillColor", "#00FF00");
				});
			}
		});
	}

	// Загружаем файл с данными на компьютер
	const downloadFile = (url, name) => {
		const link = document.createElement("a");
		if (name == undefined || name == "") {
			name = url;
		}
		link.setAttribute("href", url);
		link.setAttribute("download", name);
		onload = link.click();
		link.remove();
	};
});
