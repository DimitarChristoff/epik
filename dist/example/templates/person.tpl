<main class="ui two column grid">
	<section class="column">
		<div class="ui yellow message">This is an example of a view bound to a model via rivets.js.
		</div>

		<div class="form ui" style="background-color: rgba(255, 255, 255, .9); padding: 15px;">
			<div class="field">
				<label>Name</label>
				<input placeholder="eg. Bob" type="text" ep-value="person#name"/>
				<div class="ui red pointing above ui label" ep-show="person#name-error" ep-text="person#name-error"></div>
			</div>
			<div class="field">
				<label>Surname</label>
				<input placeholder="eg. Roberts" type="text" ep-value="person#surname" ep-class=""/>
				<div class="ui red pointing above ui label" ep-show="person#surname-error" ep-text="person#surname-error"></div>
			</div>
			<div class="field">
				<label>Age</label>
				<input placeholder="eg. 32" type="text" ep-value="person#age"/>
				<div class="ui red pointing above ui label" ep-show="person#age-error" ep-text="person#age-error"></div>
			</div>
			<div class="field">
				<label>Occupation</label>
				<input placeholder="eg. builder" type="text" ep-value="person#occupation"/>
			</div>
		</div>
	</section>
	<aside class="column ui inverted">
		<div class="ui yellow message">Current validated model data</div>
		<div class="ui warning message" style="background-color: rgba(51, 51, 51, .7); padding: 15px; display: block;">

			<ul class="list">
				<li>Name: <span class="vals" ep-text="person#name"></span></li>
				<li>Surname: <span class="vals" ep-text="person#surname"></span></li>
				<li>Age: <span class="vals" ep-text="person#age"></span></li>
				<li>Occupation: <span class="vals" ep-text="person#occupation"></span></li>
			</ul>
		</div>

		<div class="ui info message">The person view is exposed on the window object.
			Try in your console (form will update)<br/><br/>
			<code>pv.model.set('surname', 'Something Else');</code><br/><br/>
			Trigger validation errors: <br/>
			<pre class="instructive">pv.model.set({
	age: 'unknown',
	name: 'bob'
});</pre>
		</div>
	</aside>
</main>

