<main class="ui two column grid">
	<section class="column">
		<div class="ui yellow message">This is an example of a view bound to a model via rivets.js.
		</div>

		<div class="form ui inverted" style="background-color: rgba(51, 51, 51, .7); padding: 15px; display: block;text-align:right">
			<div class="inline field">
				<label>Name</label>
				<input placeholder="eg. Bob" type="text" rv-value="person#name"/>
			</div>
			<div class="inline field">
				<label>Surname</label>
				<input placeholder="eg. Roberts" type="text" rv-value="person#surname"/>
			</div>
			<div class="inline field">
				<label>Age</label>
				<input placeholder="eg. 32" type="text" rv-value="person#age"/>
			</div>
			<div class="inline field">
				<label>Occupation</label>
				<input placeholder="eg. builder" type="text" rv-value="person#occupation"/>
			</div>
		</div>
		<div class="ui message error" rv-show="error.message">{error.message}</div>

	</section>
	<aside class="column ui inverted">
		<div class="ui yellow message">Current validated model data</div>
		<div style="background-color: rgba(51, 51, 51, .7); padding: 15px; display: block;">

			<div>Name: <span rv-text="person#name"></span></div>
			<div>Surname: <span rv-text="person#surname"></span></div>
			<div>Age: <span rv-text="person#age"></span></div>
			<div>Occupation: <span rv-text="person#occupation"></span></div>
		</div>

		<div class="ui info message">The person view is exposed on the window object.
			Try in your console: <br/><br/>
			<code class="bold">pv.model.set('surname', 'Something Else');</code><br/><br/>
			Both sides of the form will update.
		</div>
	</aside>
</main>

