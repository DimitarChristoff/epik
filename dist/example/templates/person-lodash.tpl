<main class="ui two column grid">
	<section class="column">
		<div class="ui yellow message">Example of a dumb model view controller</div>

		<div class="form ui segment">
			<form method="post" action="#">
				<div class="field">
					<label>Name</label>
					<div class="ui labeled input">
						<input placeholder="eg. Bob" type="text" value="<%=name%>" name="name"/>
						<div class="ui corner label">
							<i class="asterisk icon"></i>
						</div>
					</div>
				</div>
				<div class="field">
					<label>Surname</label>
					<div class="ui labeled input">
						<input placeholder="eg. Roberts" type="text" value="<%=surname%>" name="surname"/>
						<div class="ui corner label">
							<i class="asterisk icon"></i>
						</div>
					</div>
				</div>
				<div class="field">
					<label>Age</label>
					<div class="ui labeled input">
						<input placeholder="eg. 32" type="text" value="<%=age%>" name="age"/>
						<div class="ui corner label">
							<i class="asterisk icon"></i>
						</div>
					</div>
				</div>
				<div class="field">
					<label>Occupation</label>
					<input placeholder="eg. builder" type="text" value="<%=occupation%>" name="occupation"/>
				</div>
				<input type="submit" class="ui blue submit button" value="save changes" />
			</form>
		</div>
	</section>
	<aside class="column ui inverted">
		<div class="ui yellow message">Current validated model data</div>
		<div class="ui warning message" style="background-color: rgba(51, 51, 51, .7); padding: 15px; display: block;">

			<ul class="list">
				<li>Name: <span class="vals"><%=name%></span></li>
				<li>Surname: <span class="vals"><%=surname%></span></li>
				<li>Age: <span class="vals"><%=age%></span></li>
				<li>Occupation: <span class="vals"><%=occupation%></span></li>
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

