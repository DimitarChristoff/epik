<main class="ui two column grid">
	<section class="column">
		<div class="ui yellow message">This is an example of a view bound to a model via rivets.js.
		</div>

		<div class="form ui" style="background-color: rgba(255, 255, 255, .9); padding: 15px;">
			<div class="field">
				<label>Name</label>
				<input placeholder="eg. Bob" type="text" rv-value="person#name"/>
				<div class="ui red pointing above ui label" rv-show="person#name-error" rv-text="person#name-error"></div>
			</div>
			<div class="field">
				<label>Surname</label>
				<input placeholder="eg. Roberts" type="text" rv-value="person#surname" rv-class=""/>
				<div class="ui red pointing above ui label" rv-show="person#surname-error" rv-text="person#surname-error"></div>
			</div>
			<div class="field">
				<label>Age</label>
				<input placeholder="eg. 32" type="text" rv-value="person#age"/>
				<div class="ui red pointing above ui label" rv-show="person#age-error" rv-text="person#age-error"></div>
			</div>
			<div class="field">
				<label>Occupation</label>
				<input placeholder="eg. builder" type="text" rv-value="person#occupation"/>
			</div>
		</div>
	</section>
	<aside class="column ui inverted">
		<div class="ui yellow message">Current validated model data</div>
		<div class="ui warning message" style="background-color: rgba(51, 51, 51, .7); padding: 15px; display: block;">

			<ul class="list">
				<li>Name: <span class="vals" rv-text="person#name"></span></li>
				<li>Surname: <span class="vals" rv-text="person#surname"></span></li>
				<li>Age: <span class="vals" rv-text="person#age"></span></li>
				<li>Occupation: <span class="vals" rv-text="person#occupation"></span></li>
			</ul>
		</div>

		<div class="ui info message">The person view is exposed on the window object.
			Try in your console (form will update)<br/><br/>
			<code>pv.model.set('surname', 'Something Else');</code><br/><br/>
			Trigger validation errors: <br/><br/>
			<code>pv.model.set('age':'unknown');</code><br/><br/>
		</div>
	</aside>
</main>

