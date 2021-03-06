/*
 *  Version 1.1
 *  Copyright Mark A. Sheldon, Spring 2008
 *
 *  Tools for building a calendar in a web page.  Intended to be used
 *  for making a course syllabus.  
 *
 *  The date format used to label the calendar entries is setable via
 *  set_label_format().  Three formats are currently supported:
 *
 *     "mm/dd"      :  06/31  (the default)
 *     "ddmmm"      :  31Jun
 *     "dd/mm/yyyy" :  31/06/2008 
 *
 *  Bugs/Changes:
 *  [31 Jan 2008] Realized this version doesn't work with IE.
 *
 *  [02 Feb 2008] Some investigation into IE issue.  Not clear what's
 *  going on, but it appears to be failing while including this file.
 *  I'm wondering about several things:
 *  - Does IE support prototypes correctly?  Yes.
 *  - I assume that JS include files are loaded sequentially.  Could
 *    this be false?  Not the issue.
 *  - Could it be the result of namespace pollution?  Not an issue here.
 *
 *  Solution:  IE does not support the forEach() Array instance method.  I 
 *  am grateful to the notes at http://dean.edwards.name/weblog/2006/07/enum/
 *  though I did not wind up using that code exactly.
 *
 *  [27 Feb 2008] Added debug mode support and a try/catch to capture 
 *  exceptions during a render.  Also added list of supported
 *  browsers. 
 *  - A Calendar object now has a debug_mode property (either 0 or 1,
 *    defaults to 0) and debug_mode_on() and debug_mode_off() methods.
 *  - If an error arises during a render operation, a message gets
 *    written to the document listing supported browsers.  If
 *    debug_mode is on (> 0), then the actual exception name and
 *    message are also printed.
 *
 *  [26 Aug 2008] Changed all_holiday() to add "<br>" to the end of
 *  each entry. 
 *
 *  [Aug 2014] Added additional debugging output because it's not producing
 *  any output at all. Ah, that was because my start time was after my end time.
 *  I added a check for that.
 *
 *  [Aug 2016] Better error messages.
 *
 *  To do:
 *  o Try to isolate user from syntax problems with data entry.  The
 *    real solution to this is probably to specify a single
 *    S-expression-type data format that they can pass to a single
 *    function call.  Then I can parse that and give good error
 *    messages rather than just having JavaScript crash.
 *    
 *    Another solution would be some sort of protect() macro they can
 *    use to wrap their function calls in.
 *  
 */

cal_supported_browsers = "Firefox (my primary platform) version 2 or higher, "
	+ "Safari version 3 or higher, "
        + "IE version 6 or higher on XP and Vista";

/*  The following code is for IE:  if there is no forEach() Array instance
 *  instance method, add one.
 */
if (Array.prototype.forEach == undefined)
        Array.prototype.forEach = 
                function (f) 
                {
                        for (var i = 0; i < this.length; i++)
                                f(this[i]);
                };

function Link(name, target, class_name)
{
	this.name = name;
	this.target = target;
	this.class_name = class_name;
}

Link.prototype =
{
   toHtml: function()
           {
	 	  var the_target = (this.target == null) ? ""
		                                         : " href = '"
		                                           + this.target + "'";
                  var the_class = (this.class_name == null) ? ""
	  	                                            : " class = '"
                         		                      + this.class_name
                                                              + "'";

  		   return "<a" + the_target + the_class + ">"
		          + this.name + "</a>";
	   }
}

function makeLink(name, target, class_name)
{
	return new Link(name, target, class_name);
}

function fakeLink(name, target, class_name)
{
	var the_class = ((class_name == null) ? "" : class_name + " ")
   		        + "unavailable";

	return new Link(name, null, the_class);
}

function isLink(thing)
{
	return thing instanceof Link;
}

var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
	      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function date_to_label_ddmmm(the_date)
{
        return two_digits(the_date.getDate())
	       + MONTHS[the_date.getMonth()];
}

function date_to_label_mm_slash_dd(the_date)
{
	return two_digits(the_date.getMonth() + 1)
	        + "/"
		+ two_digits(the_date.getDate());
}

function date_to_label_dd_slash_mm_slash_yyyy(the_date)
{
	return two_digits(the_date.getDate())
		+ "/"
		+ two_digits(the_date.getMonth() + 1)
		+ "/"
		+ the_date.getFullYear();
}


/*
 *  Feel free to extend the date formats.  If you define one that you're
 *  happy with and you'd like to share it, please send it to me.  I will
 *  include it in future versions (and you will receive credit, of
 *  course). 
 */
function set_label_format(fmt)
{
	if (fmt == "ddmmm")
		this.date_to_label = date_to_label_ddmmm;
	else if (fmt == "mm/dd")
		this.date_to_label = date_to_label_mm_slash_dd;
	else if (fmt == "dd/mm/yyyy")
		this.date_to_label = date_to_label_dd_slash_mm_slash_yyyy;
	else
		this.date_to_label = date_to_label_dd_slash_mm_slash_yyyy;
}


function setYear(year) {
    if( year >= 2008 && year < 3000 ) {
        this.year = year;
    } else {
        throw new Error("Year should be a number like 2008: "+year);
    }     
}

function getYear() {
    if(this.year) return this.year;
    throw new Error("Year not set");
}
    

/* label argument is required.  Creates a bucket for this label in the 
 * calendar, and then adds each item in the remaining arguments to the
 * calendar under that label.
 */
function add_info (label, new_info /*, ... */)
{
    var year = this.getYear();
    var date = new Date(label+year);
    var day = date.getDay();
    if( day == 0 || day == 6 ) {
        var allinfo = "";
        for( var i = 1; i < arguments.length; i++) {
            allinfo += arguments[i];
        }
        alert(label+" ("+allinfo+") falls on weekend");
        }

	var old_info = this.info[label];

	if (old_info == null)
		old_info = this.info[label] = [];

	for (var i = 1; i < add_info.arguments.length; ++i)
		old_info[old_info.length] = add_info.arguments[i];
}

function add_holiday(label, holiday_name)
{
	this.holidays[label] = holiday_name + "<br>";
}

/* Arguments are assumed to come in pairs:  first of each pair is the label
 * for the holiday (the date), the second is the name of the holiday.
 */
function add_holidays(/* var args */)
{
	for (var i = 0; i < add_holidays.arguments.length; i += 2)
		this.add_holiday(add_holidays.arguments[i],
				 add_holidays.arguments[i + 1]);
}

function render_cell(the_date)
{
	var cell_label   = this.date_to_label(the_date);
        var holiday_info = this.holidays[cell_label];

	if (holiday_info != null)
		document.write("<td class='holiday'>\n"
		               + "<sup>" + cell_label  + "</sup><br>"
                               + holiday_info);
	else
		document.write("<td>\n"
			       + "<sup>" + cell_label + "</sup><br>");
	this.render_info(cell_label);

        document.write("</td>\n");
}

/* Should a date label go here? */
function render_filler(the_date)
{
	document.write("<td class = 'filler'>"
                       + "&nbsp;"
                       + "</td>");
}

function render_link(lnk)
{
	document.write(lnk.toHtml());
}

function render_info(label)
{
	var info = this.info[label];

	function render_item(item)
	{
		if (isLink(item)) {
			render_link(item);
			document.write("<br>");
		} else
			document.write(item + "<br>");
	}

	if (info == null) return;

	info.forEach(render_item);
}

/*
function render_solution(label)
{
}
*/

function two_digits(n)
{
        return ((n < 10) ? "0" : "") + n;
}

function increment_date(curr_date, ndays)
{
	curr_date.setDate(curr_date.getDate() + ndays);
	return curr_date;
}

function render_row(curr_date, start_time, end_time)
{
	document.write("  <tr>\n");
	//document.write("<td>"+curr_date.getDate()+"</td>\n");

	for (var i = 1; i <= 5; i++) {
		var curr_time = curr_date.getTime();

		if ((curr_time < start_time) || (curr_time > end_time)) {
            if( this.debug_mode > 0 ) {
                console.log(curr_date+" is outside calendar range, so just a filler cell.");
            }
			this.render_filler(curr_date);
        }
		else
			this.render_cell(curr_date);

		curr_date = increment_date(curr_date, 1);
	}

	document.write("  </tr>\n");
	return curr_date;
}


// Outputs an HTML table.
// start is a Date object for the fist day of the calendar.
// end is a Date object for last day of the calendar.
// table_args is a string containing any arguments to the TABLE tag. 
// render_cell is a function that will be called to render the
//    contents of every cell.  render_cell must take a single parameter
//    that contains the Date for the cell.
// render_filler is another function that takes a date object and
//    renders a cell that occurs before the start date or after the
//    end date that must be present to fill out the first and last
//    rows. 
function render_calendar()
{
	try {
		var curr_date  = new Date(this.start);
		var start_time = this.start.getTime();
		var end_time   = this.end.getTime();

        if (start_time > end_time) {
            if( this.debug_mode > 0 ) {
               console.log("Your start_time is after your end_time, so there's nothing to do");
            }
            return;
        }

		// Go back to preceding Monday.
		curr_date.setDate(this.start.getDate()
				  - (this.start.getDay() - 1));

		document.write("<table "
			       + class_to_html(this.class_name)
			       + ">\n");
		document.write("  <tr>\n" 
			       + "    <th>Mon</th>\n"
			       + "    <th>Tue</th>\n"
			       + "    <th>Wed</th>\n"
			       + "    <th>Thu</th>\n"
			       + "    <th>Fri</th>\n"
			       + "  </tr>");

		while (curr_date.getTime() <= end_time) {
			curr_date = this.render_row(curr_date, start_time, end_time);
            // skip weekend
			curr_date = increment_date(curr_date, 2); 
		}

		document.write("</table>\n");
	} catch (e) {
		document.write("There has been an error rendering a calendar.  "
			       + "If you are not the maintainer of the site, "
			       + "be sure that you are using a supported "
			       + "browser: <br>"
			       + cal_supported_browsers);
		if (this.debug_mode > 0)
			document.write("The error received was:<br>:"
				       + e.name
				       + "<br>"
				       + "and the message was:<br>"
				       + e.message);
	}
}


function set_class(class_name)
{
	this.class_name = class_name;
}

function class_to_html(class_name)
{
	if (class_name != null)
		return "class = '" + class_name + "'";
	else
		return "";
}

/*  IE v 6 and above on Vista and XP work now
function IEwarn()
{
        document.write("<div style = 'background-color: #E9967A;'>"
		       + "The JavaScript Calendar package does not currently"
		       + " support Internet Explorer."
		       + "<p>We intend to support it if possible, however"
		       + " for now you will have to use a browser with better"
                       + " JavaScript support, such as Firefox or Safari."
                       + "<p>Thank you for your patience."
		       + "</div>");
}
*/

function debug_mode_on()
{
	this.debug_mode = 1;
}

function debug_mode_off()
{
	this.debug_mode = 0;
}

var calendar_prototype = {
        debug_mode:        0,
	debug_mode_on:     debug_mode_on,
	debug_mode_off:    debug_mode_off,
        holidays:          {},
	info:              {},
	class_name:        null,
	date_to_label:     date_to_label_mm_slash_dd,
        set_label_format:  set_label_format,
	add_info:          add_info,
        add_holiday:       add_holiday,
        add_holidays:      add_holidays,
    setYear:           setYear,
    getYear:           getYear,
	set_class:         set_class,
	render:            render_calendar,
	render_row:        render_row,
	render_info:       render_info,
	render_cell:       render_cell,
	render_filler:     render_filler
};

function Calendar(start_date, end_date)
{
	this.start = start_date;
	this.end   = end_date;

/*	if (navigator.appName == "Microsoft Internet Explorer")
		this.render = IEwarn;
*/
}

Calendar.prototype = calendar_prototype;

/* Intended to hook in with CSS.  Question, should this be left to 
   client, put in a separate calendar_utils.js, or left here?
 */
function admin_note (note)
{
        return "<span class = 'admin'>" + note + "</span>\n";
}
