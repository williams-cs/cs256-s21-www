/*   This has been adapted from Wellesley CS235's calendar.js
 *   For future use, one may as well put in all the dates for the entire year.
 *   Only entries withing the calendar's date interval will get rendered.
 */
/* Month is 0-11 */
var williams_start = new Date(2021,  1,  17);  /* February 17, 2021 */  
var williams_end   = new Date(2021, 4, 28);  /* May 28, 2021 */


function add_williams_holidays(cal)
{       var blank_line = ""; 
	cal.add_holidays(
                         "18Feb", "<br> Claiming Williams Day",
                         "22Mar", "<br> Reading Period",
                         "23Mar", "<br> Reading Period",
                         "21Apr", "<br> Health Day <br>",
                         "22Apr", "<br> Health Day <br>",
                         "07May", "<br> Health Day <br>",
                         "20May", "<br> Reading Period",
                         "21May", "<br> Reading Period");
}

function add_williams_admin(cal)
{       var blank_line = ""; 
        cal.add_info("19May", admin_note("<br><br>Last day of Classes"));
        cal.add_info("17Feb", admin_note("<br><br>No Lecture:  Thursday Schedule"));
        cal.add_info("24May", admin_note("Final Exam Period"));
        cal.add_info("25May", admin_note("Final Exam Period"));
        cal.add_info("26May", admin_note("Final Exam Period"));
        cal.add_info("27May", admin_note("Final Exam Period"));
        cal.add_info("28May", admin_note("Final Exam Period"));
}

/* If someone wants a pre-made calendar that they can just add their
 * course items to, here it is.  The administrative dates are NOT
 * included here, because a) my intuition is that some people may not
 * want the administrative dates and b) if they do want them, they
 * will likely want them at the bottom of each calendar day (after any
 * course content).  So, they can call the above function if they want.
 */

var williams_calendar = new Calendar(williams_start,
				      williams_end);


