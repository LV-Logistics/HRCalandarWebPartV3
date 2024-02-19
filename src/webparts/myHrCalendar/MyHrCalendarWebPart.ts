import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import YearCalendar from 'js-year-calendar';
import 'js-year-calendar/dist/js-year-calendar.css';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import 'bootstrap'; // Import Bootstrap JavaScript
import * as jQuery from 'jquery';
import 'bootstrap';

import './HrCalendar.css';
import CalendarDataSourceElement from 'js-year-calendar/dist/interfaces/CalendarDataSourceElement';

export interface IMyHrCalandarJsWebPartProps {
}
interface ExtendedCalendarDataSourceElement extends CalendarDataSourceElement {
  startScope?: string;
  endScope?: string;
}

export interface IMyHrCalendarWebPartProps {
  description: string;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Office: ISPOffice;
  Department: ISPDepartment;
  Id: string;
}

export interface ISPDepartment {
  Title: string;
  Id: string;
}
export interface ISPOffice {
  Title: string;
  Id: string;
}

export default class MyHrCalandarJsWebPart extends BaseClientSideWebPart<IMyHrCalandarJsWebPartProps> {

  // <button
  //                           id="weekButton" type="button" title="week view" aria-pressed="false"
  //                           class="fc-timeGridWeek-button fc-button fc-button-primary">week</button><button
  //                           id="dayButton" type="button" title="day view" aria-pressed="false"
  //                           class="fc-timeGridDay-button fc-button fc-button-primary">day</button><button type="button"
  //                           id="listButton" title="list view" aria-pressed="false"
  //                           class="fc-listWeek-button fc-button fc-button-primary">list</button></div>

  public render(): void {
    this.domElement.innerHTML = `<div id="popup">Hover over me!</div>
    <div class="grid-container">
        <!-- <div class="grid-item">
            <label for="viewSelector">Select View:</label>
            <select id="viewSelector" onchange="toggleView()">
                <option value="month">Month Calandar</option>
                <option value="calendar">Full Calendar</option>
            </select>
        </div>-->
        <div class="grid-item">
            <div id="viewSelectorDiv" class="hidden" style="display: inline-block;">
                <label for="modeSelector">Mode:</label>
                <select id="modeSelector" onchange="toggleMode()">
                    <option value="team">Team</option>
                    <option value="single">Single User</option>
                </select>
            </div>
        </div>
        <div class="grid-item">
            <div id="TeamMode">
                <label for="dropdown" id="dropdownLabel">Select an option:</label>
                <select id="dropdown">
                    <option name="All" value="all">My Team</option>
                    <option name="Loc" value="location">My Office</option>
                    <option name="Dep" value="department">My Department</option>
                </select>
            </div>
            <div id="SingleMode">
                <!-- <label for="dropdown2">Select an option:</label>
                <select id="dropdown2">
                    <option name="All" value="all">My Direct Reports</option>
                    <option name="Loc" value="location">My Office</option>
                    <option name="Dep" value="department">My Department</option>
                </select> -->

                <label for="dropdownForUsers">Select an User:</label>
                <select id="dropdownForUsers">
                    <option value="all">My Team</option>
                </select>
                <div id="colorLegend" class="legend"></div>
            </div>
        </div>
    </div>

    <div id='fullCalendar'></div>

    <div id="YearCalendar" class="hidden">
        <div id="fullCalendarxx" class="fc fc-media-screen fc-direction-ltr fc-theme-standard">
            <div class="fc-header-toolbar fc-toolbar fc-toolbar-ltr">
                <div class="fc-toolbar-chunk" style="width: 15%;">
                    <h2 class="fc-toolbar-title" id="fc-dom-1"> </h2>
                </div>
                <div class="fc-toolbar-chunk">
                    <h2 class="fc-toolbar-title" id="fc-dom-1">Year Calendar</h2>
                </div>
                <div class="fc-toolbar-chunk">
                    <div class="fc-button-group"><button type="button" title="Year" aria-pressed="false"
                            class="fc-myCustomYear-button fc-button fc-button-primary fc-button-active">year</button><button
                            id="monthButton" type="button" title="month view" aria-pressed="true"
                            class="fc-dayGridMonth-button fc-button fc-button-primary">month</button>
                </div>
            </div>
        </div>
        <div id="calendar"></div>
    </div>

    <div id="TeamMode" class="grid-container2">
        <div class="grid-item"><button id="selectAllButton" onclick="selectAll()">Select All</button>
            <button id="unselectAllButton" onclick="unselectAll()">Unselect All</button>

            <div id="nameContainer"></div>
        </div>
    </div>

    <!-- Loading screen HTML -->
    <div id="loading-screen">
        <div id="loading-text">Loading...</div>
    </div>
    <div id="popup">Hover over me!</div>`;


    /////////////////////////////////////////////////////////

    


    let fullCalendarInstance: FullCalendar;
    let yearCalendarInstance: YearCalendar<CalendarDataSourceElement>;

    teamModeDiv = document.getElementById("TeamMode");
    singleModeDiv = document.getElementById("SingleMode");

    let currentYear = new Date().getFullYear().toString();

    let fullCalandarLastStartDate = "";
    let fullCalandarLastEndDate = "";

    document.getElementById('dropdown')?.addEventListener('change', function () {
      // Get the selected option's name attribute
      var selectedOptionName = (this as HTMLSelectElement).options[(this as HTMLSelectElement).selectedIndex].getAttribute('name');
      getLeave(selectedOptionName, currentYear.toString() + "-01-01", currentYear.toString() + "-12-01");
    });

    document.getElementById('dropdownForUsers')?.addEventListener('change', function () {
      renderCalandarWithDataSimple();

    });
    if (singleModeDiv != null && teamModeDiv != null) {
      singleModeDiv.style.display = "none";
      teamModeDiv.style.display = "block";
    }

    document.getElementById("monthButton")?.addEventListener('click', function () {
      toggleView("month");
    });
    document.getElementById("weekButton")?.addEventListener('click', function () {
      toggleView("week");
    });
    document.getElementById("dayButton")?.addEventListener('click', function () {
      toggleView("day");
    });
    document.getElementById("listButton")?.addEventListener('click', function () {
      toggleView("list");
    });
    document.getElementById("modeSelector")?.addEventListener('click', function () {
      toggleMode();
    });


    initialiseBothCalandars();
    ///////////////////////////////////////////////////////////////

    //let currentYearForMonthCalandar = null;
    var jsonData: any[];
    var teamModeDiv: HTMLElement | null;
    var singleModeDiv: HTMLElement | null;
    var mode = "month";

    // // Array to store distinct colors
    // const distinctColors = [
    //   '#1f78b4', // blue
    //   '#33a02c', // green
    //   '#e31a1c', // red
    //   '#ff7f00', // orange
    //   '#6a3d9a', // purple
    //   '#a6cee3', // light blue
    //   '#b2df8a', // light green
    //   '#fb9a99', // light red
    //   '#fdbf6f', // light orange
    //   '#cab2d6', // light purple
    //   '#008080', // teal
    //   '#d95f02', // brown
    //   '#7570b3', // lavender
    //   '#e7298a', // pink
    //   '#66a61e', // olive
    //   '#fee08b', // light yellow
    //   '#edf8b1', // pale green
    //   '#fdb462', // orange-yellow
    //   '#3182bd', // dark blue
    //   '#31a354', // dark green
    //   '#deebf7', // light sky blue
    //   '#fdae61', // light orange
    //   '#abd9e9', // light teal
    //   '#fee08b', // light yellow
    //   '#d73027', // dark red
    //   '#4575b4', // steel blue
    //   '#91bfdb', // sky blue
    //   '#313695', // dark navy
    //   '#a50026', // dark maroon
    //   '#800080', // purple
    // ];

    // // Variable to store the index of the last picked color
    // let lastColorIndex = -1;

    // Function to get a distinct color
    // function getDistinctColor() {
    //   // Increment the index to get the next color
    //   lastColorIndex = (lastColorIndex + 1) % distinctColors.length;

    //   // Return the color at the current index
    //   return distinctColors[lastColorIndex];
    // }

    function toggleUser(button: HTMLElement | null) {
      if (button != null) {
        var button = document.getElementById(button.id);
        if (button) {
          button.classList.toggle('grayed-out'); // Toggle the 'grayed-out' class
          renderCalandarWithDataSimple();
        }
      }
    }

    function filterByNames(data: any[] | undefined, namesToFilter: any[]) {
      if (!data) {
        return [];
      }

      return data.filter(function (entry) {
        return namesToFilter.includes(entry.name);
      });
    }

    // function getEmailFromUrl() {
    //   const searchParams = new URLSearchParams(window.location.search);
    //   return searchParams.get('email');
    // }

    // function getLocationFromUrl() {
    //   const searchParams = new URLSearchParams(window.location.search);
    //   return searchParams.get('location');
    // }

    // function getDepartmentFromUrl() {
    //   const searchParams = new URLSearchParams(window.location.search);
    //   return searchParams.get('department');
    // }

    // function convertToDate(item: { startDate: string | number | Date; endDate: string | number | Date; }) {
    //   item.startDate = new Date(item.startDate);
    //   item.endDate = new Date(item.endDate);
    //   return item;
    // }

    // // Function to calculate the contrast ratio between two colors
    // function getContrast(color1: any, color2: any) {
    //   var lum1 = getLuminance(color1) + 0.05;
    //   var lum2 = getLuminance(color2) + 0.05;
    //   return Math.max(lum1, lum2) / Math.min(lum1, lum2);
    // }

    // // Function to calculate the relative luminance of a color
    // function getLuminance(color: string) {
    //   var rgb = parseInt(color.slice(1), 16);
    //   var r = (rgb >> 16) & 0xff;
    //   var g = (rgb >> 8) & 0xff;
    //   var b = (rgb >> 0) & 0xff;

    //   r /= 255;
    //   g /= 255;
    //   b /= 255;

    //   r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    //   g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    //   b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    //   return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // }


    function renderCalandarWithDataSimple() {

      console.log("render");

      var nameButtons = document.querySelectorAll('.name-button:not(.grayed-out)');
      var innerHtmlArray = [];

      nameButtons.forEach(function (button) {
        innerHtmlArray.push(button.innerHTML);
      });

      if (teamModeDiv != null) {
        // Toggle visibility
        if (teamModeDiv.style.display === "block") {
          nameButtons.forEach(function (button) {
            innerHtmlArray.push(button.innerHTML);
          });
        } else {
          innerHtmlArray = [];
          innerHtmlArray.push((<HTMLInputElement>document.getElementById("dropdownForUsers")).value)

        };
      }

      let filteredJson = filterByNames(jsonData, innerHtmlArray);
      console.log("t1");
      if (teamModeDiv) {
        if (teamModeDiv.style.display === "none") {
          filteredJson = assignRandomColorsPerDescription(filteredJson);
          createLegend(filteredJson);
          if (filteredJson) {
            console.log("t3");
            yearCalendarInstance.setDataSource(filteredJson);
          }
        };

        console.log(mode);
        if (mode === "month") {
          SetFullCalandar(filteredJson);
        } else {
          if (filteredJson) {
            console.log(filteredJson);
            yearCalendarInstance.setDataSource(filteredJson);
          }
        }

      }
    }

    // function renderCalandarWithData() {

    //   var nameButtons = document.querySelectorAll('.name-button:not(.grayed-out)');
    //   var innerHtmlArray: any[] = [];

    //   nameButtons.forEach(function (button) {
    //     innerHtmlArray.push(button.innerHTML);
    //   });

    //   var filteredJson = filterByNames(jsonData, innerHtmlArray);;


    //   (<HTMLInputElement>document.querySelector('#calendar')).addEventListener('yearChanged', function (e) {
    //     currentYear = e.currentYear;

    //     var dropdown = document.getElementById('dropdown') as HTMLSelectElement; 
    //     if (dropdown != null) {
    //       var selectedOptionName = dropdown.options[dropdown.selectedIndex].getAttribute('name');
    //       getLeave(selectedOptionName, currentYear.toString() + "-01-01", currentYear.toString() + "-12-01");
    //     }
    //   });

    // }

    interface DataItem {
      description: string;
      color?: string; // Optional color property
    }

    function assignRandomColorsPerDescription(dataArray: DataItem[]) {
      const colorMap: { [description: string]: string } = {};

      function getDistinctColor(): string {
        // Implement the logic to generate a random color
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
      }

      dataArray.forEach((item) => {
        const { description } = item;

        if (!colorMap[description]) {
          colorMap[description] = getDistinctColor(); // Implement getDistinctColor function
        }

        item.color = colorMap[description];
      });

      return dataArray;
    }

    function getLeave(selectedOptionName: string | null, startDate: string, endDate: string) {

      showLoadingScreen();

      // Get all buttons with the class name 'button'
      const buttons = document.querySelectorAll('.name-button');

      // Loop through the buttons and remove each one
      buttons.forEach(button => {
        button.remove();
      });

      // URL for the POST request
      const apiUrl = "https://adminfunctionslv.azurewebsites.net/api/GetHolidayForCalandar?code=WddDPiob_V3tVLDp7SLFw9KmVVq4YQB5jPaaSE6qW3b4AzFuHW4U3A==";

      // Data to be sent in the POST request
      const data = {
        //upn: getEmailFromUrl(),
        upn: "Ed.Hodson@lv-logistics.com",
        type: selectedOptionName,
        //location: getLocationFromUrl(),
        //department: getDepartmentFromUrl(),
        location: "Telford Road",
        department: "LV IT",
        startDate: startDate,
        endDate: endDate,
        authToken: "18ec615b-c241-4402-855b-7f8a89201477"
      };

      // Fetch options for the POST request
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };


      interface UserData {
        name: string;
        description: string;
        color?: string;
        endDate:Date
        endScope?: string;
        id?: string;
        startDate:Date;
        startScope?: string;
      
      }

      interface NameColorMap {
        [name: string]: string;
      }

      function convertToDate(item: UserData): UserData {
        item.startDate = new Date(item.startDate);
        item.endDate = new Date(item.endDate);
        return item;
      }

      function getDistinctColor(): string {
        // Implement the logic to generate a random color
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
      }

      fetch(apiUrl, fetchOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: UserData[]) => {
          jQuery(function () {

            var dropdown = document.getElementById("dropdownForUsers") as HTMLSelectElement;

            dropdown.options.length = 0;

            var nameColorMap: NameColorMap = {};

            jsonData = data.map(convertToDate);

            if (jsonData.length > 1) {
              jsonData.forEach(function (item) {
                var name = item.name;
                if (!nameColorMap[name]) {
                  nameColorMap[name] = getDistinctColor();
                  var newOption = document.createElement("option");
                  newOption.value = item.name;
                  newOption.text = item.name;
                  dropdown.add(newOption);
                }
                item.color = nameColorMap[name];
              });
            } else {
              jsonData.forEach(function (item) {
                var name = item.description;
                if (!nameColorMap[name]) {
                  nameColorMap[name] = getDistinctColor();
                  var newOption = document.createElement("option");
                  newOption.value = item.name;
                  newOption.text = item.name;
                  dropdown.add(newOption);
                }
                item.color = nameColorMap[name];
              });
            }

            var testContainer = document.getElementById('nameContainer');
            for (var name in nameColorMap) {
              var button = document.createElement('button');
              button.className = 'name-button';
              button.innerText = name;
              var newId = "user_" + name.replace(/\s/g, '');
              button.id = newId;
              button.style.backgroundColor = nameColorMap[name];
              button.addEventListener('click', function () {
                toggleUser(this);
              });
              if (testContainer != null) {
                testContainer.appendChild(button);
              }
            }

            renderCalandarWithDataSimple();
            hideLoadingScreen();
          });

        })
        .catch(error => {
          hideLoadingScreen();
          console.error('Error during POST request:', error);
          alert(error);
        });

    }

    // function selectAll() {
    //   var buttons = document.getElementsByClassName('grayed-out');

    //   // Click each button in the collection
    //   for (var i = 0; i < buttons.length; i++) {
    //     var button = buttons[i] as HTMLElement; // Cast to HTMLElement
    //     button.click();
    //   }
    // }

    // // Function to handle the "Unselect All" button click
    // function unselectAll() {
    //   const buttons = Array.prototype.slice.call(document.querySelectorAll('.name-button:not(.grayed-out)'));


    //   for (let i = 0; i < buttons.length; i++) {
    //     buttons[i].click();
    //   }
    // }

    function createLegend(filteredJson: any[]) {

      removeLegendColors();

      if (filteredJson.length > 0) {


        const colorLegend = document.getElementById("colorLegend");

        const uniqueDescriptions = [...new Set(filteredJson.map(item => item.description))];

        uniqueDescriptions.forEach(description => {
          const legendItem = document.createElement("div");
          legendItem.className = "legend-item";

          const legendColor = document.createElement("div");
          legendColor.className = "legend-color";
          legendColor.style.backgroundColor = getLegendColor(description, filteredJson);

          const legendText = document.createElement("span");
          legendText.textContent = description;

          legendItem.appendChild(legendColor);
          legendItem.appendChild(legendText);
          if (colorLegend != null) {
            colorLegend.appendChild(legendItem);
          }
        });
      }
    }

    function getLegendColor(description: any, filteredJson: any[]) {
      const matchingItem = filteredJson.find(item => item.description === description);
      return matchingItem ? matchingItem.color : "#000000"; // Default color if not found
    }

    function removeLegendColors() {
      const legendColors = document.querySelectorAll('.legend-item');

      // Iterate through each element and remove it
      legendColors.forEach(element => {
        if (element.parentNode != null) {
          element.parentNode.removeChild(element);
        }
      });
    }

    function getScopeText(inputEvent: ExtendedCalendarDataSourceElement) {
      if (inputEvent.endScope == null) {
        return " (" + inputEvent.startScope + ")";
      } else {
        return " (" + inputEvent.startScope + "-" + inputEvent.endScope + (")")
      }



    }

    // Function to show the popup
    function showPopup(message: any) {
      var popup = document.getElementById('popup');
      if (popup != null) {
        popup.innerHTML = message;
        popup.style.display = 'block';
      }
    }

    function padNumber(num: number): string {
      return num < 10 ? `0${num}` : num.toString();
    }


    // Function to hide the popup
    // function hidePopup() {
    //   var popup = document.getElementById('popup');
    //   if (popup != null) {
    //     popup.style.display = 'none';
    //   }
    // }



    function initialiseBothCalandars() {
      //var popup = document.getElementById('popup');

      //month calandar
      var calendarEl = document.getElementById('fullCalendar');
      if (calendarEl != null) {
        fullCalendarInstance = new FullCalendar(calendarEl, {
          plugins: [
            dayGridPlugin
            // any other plugins
          ],
          initialView: 'dayGridMonth', headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'myCustomYear,dayGridMonth',//timeGridWeek,timeGridDay,listWeek
          }, datesSet: function (e: { startStr: string; endStr: string; }) {
            var dropdown = document.getElementById('dropdown') as HTMLSelectElement;
            var selectedOptionName;
            fullCalandarLastStartDate = e.startStr.substring(0, 10);
            fullCalandarLastEndDate = e.endStr.substring(0, 10);
            if (dropdown) {
              selectedOptionName = dropdown.options[dropdown.selectedIndex]?.getAttribute('name');
            }
            if (selectedOptionName) {
              getLeave(selectedOptionName, e.startStr.substring(0, 10), e.endStr.substring(0, 10));
            }
          }, eventMouseEnter: function (e) {
            showPopup(e.event._def.title);

          },
          contentHeight: "auto",
          eventMouseLeave: function (e) {
            var popup = document.getElementById('popup');
            if (popup) {
              popup.style.display = 'none';
            }
          }, customButtons: {
            myCustomYear: {
              text: 'year',
              click: function () {
                //const modeDiv = document.getElementById("viewSelectorDiv");
                //const viewSelector = document.getElementById("viewSelector");
                const fullMonthModeDiv = document.getElementById("fullCalendar");
                const fullCalendarDiv = document.getElementById("YearCalendar");
                mode = "year";
                var dropdown = document.getElementById('dropdown') as HTMLSelectElement;

                var selectedOptionName = dropdown.options[dropdown.selectedIndex].getAttribute('name');

                fullMonthModeDiv?.classList.add("hidden");
                fullCalendarDiv?.classList.remove("hidden");
                //modeDiv.classList.remove("hidden");
                getLeave(selectedOptionName, currentYear.toString() + "-01-01", currentYear.toString() + "-12-01");

              }
            }
          }
        });

        fullCalendarInstance.render();
      }

      //year calandar

      const yearCalendarEl = document.getElementById('calendar');
      if (yearCalendarEl) {
        yearCalendarInstance = new YearCalendar(yearCalendarEl, {
          enableContextMenu: true,
          loadingTemplate: "",

          mouseOnDay: function (e) {
            if (e.events.length > 0) {
              var content = '';

              for (var i in e.events) {
                content += '<div class="event-tooltip-content">'
                  + '<div class="event-name" style="color:' + e.events[i].color + '">' + e.events[i].name + '</div>'
                  + '<div class="event-description">' + e.events[i].name + getScopeText(e.events[i]) + '</div>'
                  + '</div>';
              }

              (jQuery(e.element)as any).popover({
                trigger: 'manual',
                container: 'body',
                html: true,
                content: content
              });

              (jQuery(e.element)as any).popover('show');
            }
          },
          mouseOutDay: function (e) {
            if (e.events.length > 0) {
              (jQuery(e.element)as any).popover('hide');
            }
          },
          dayContextMenu: function (e) {
            (jQuery(e.element)as any).popover('hide');
          }
         }
        );

      }
    }


    // Function to turn on the loading screen
    function showLoadingScreen() {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'block';
      }
    }

    // Function to turn off the loading screen
    function hideLoadingScreen() {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'block'; // Show loading screen
        // Some operations...
        loadingScreen.style.display = 'none'; // Hide loading screen
      }
    }

    function formatDateToYYYYMMDD(dateString: string | number | Date) {
      const inputDate = new Date(dateString);

      const year = inputDate.getFullYear();
      const month = padNumber(inputDate.getMonth() + 1); // Months are 0-based
      const day = padNumber(inputDate.getDate());

      return `${year}-${month}-${day}`;
    }

    // Convert the array to FullCalendar event objects
    function convertToFullCalendarEvents(originalArray: any[]) {

      const convertedEvents = originalArray.map(item => {
        const convertedEvent = {
          title: item.name + ' - ' + item.description + getScopeText(item),
          start: formatDateToYYYYMMDD(item.startDate),
          end: formatDateToYYYYMMDD(item.endDate),
          color: item.color // Optional: Add the color if available
        };

        // Optional: You can customize the title, start, and end properties based on your requirements

        return convertedEvent;
      });

      return convertedEvents;
    }

    function SetFullCalandar(filteredJson: any[] | null) {
      if (filteredJson) {



        let convertedArray = convertToFullCalendarEvents(filteredJson);

        //remove existing events
        //const allEvents = fullCalendar.getEvents();
        fullCalendarInstance.getEvents().forEach(event => event.remove());

        fullCalendarInstance.addEventSource(convertedArray);
        fullCalendarInstance.render();
      }


    };

    function toggleView(buttonClicked: string) {

      //const modeDiv = document.getElementById("viewSelectorDiv");
      //const viewSelector = document.getElementById("viewSelector");
      const fullMonthModeDiv = document.getElementById("fullCalendar");
      const fullCalendarDiv = document.getElementById("YearCalendar");
      fullMonthModeDiv?.classList.remove("hidden");
      fullCalendarDiv?.classList.add("hidden");
      const modeSelector = document.getElementById('loading-screen') as HTMLInputElement;
      if (modeSelector) {
        modeSelector.value = "team";
      }

      switch (buttonClicked.toLowerCase()) {
        case 'month':
          mode = "month";
          (document.getElementsByClassName('fc-dayGridMonth-button')[0] as HTMLElement).click();
          break;
        case 'week':
          mode = "month";
          (document.getElementsByClassName('fc-timeGridWeek-button')[0] as HTMLElement).click();

          break;
        case 'day':
          mode = "month";
          (document.getElementsByClassName('fc-timeGridDay-button')[0] as HTMLElement).click();
          break;
        case 'list':
          mode = "month";
          (document.getElementsByClassName('fc-listWeek-button')[0] as HTMLElement).click();
          break;
      }
    }

    function toggleMode() {

      var selectedOptionMode = (document.getElementById("modeSelector")as HTMLInputElement).value;

      // Toggle visibility
      if (selectedOptionMode == "single") {
        var selectedOptionName2 = "All";
        getLeave(selectedOptionName2, fullCalandarLastStartDate, fullCalandarLastEndDate);
        if(teamModeDiv){
          teamModeDiv.style.display = "none";
        }
        let TeamMode = document.getElementById("TeamMode");
        if(TeamMode){
          TeamMode.style.display = "none";
        }
        if(singleModeDiv){
        singleModeDiv.style.display = "block";
        }
      } else {
        var dropdown = document.getElementById('dropdown') as HTMLSelectElement;
        var selectedOptionName = dropdown.options[dropdown.selectedIndex].getAttribute('name');
        getLeave(selectedOptionName, currentYear.toString() + "-01-01", currentYear.toString() + "-12-01");
        if(singleModeDiv){
        singleModeDiv.style.display = "none";
        }
        if(teamModeDiv){
        teamModeDiv.style.display = "block";
        }
        let TeamMode = document.getElementById("TeamMode");
        if(TeamMode){
          TeamMode.style.display = "block";
        }

      }
    }


  }

  protected onInit(): Promise<void> {





    return super.onInit();


  }
}
