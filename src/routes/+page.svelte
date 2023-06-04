<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import rojhon from '$lib/images/Rojhon.png';
</script>

<svelte:head>
	<title>Rojhon Buenaventura</title>
	<meta name="description" content="This is Portfolio" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={rojhon} type="image/webp" />
				<img src={rojhon} alt="Welcome" />
			</picture>
		</span>

		Hi, I'm a <br />Computer Engineer
	</h1>

	<h2>
		<strong>Engr. ROJHON BUENAVENTURA</strong> is at your service.
	</h2>

	<!-- <Counter /> -->
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 1938 / 1936) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
