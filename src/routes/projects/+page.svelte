<script>
	import sav from '$lib/images/projects/sorting-algorithm-visualizer.png';
	import sav2 from '$lib/images/projects/sorting-algorithm-visualizer2.png';
	import barangay1 from '$lib/images/projects/barangay1.png';
	import barangay2 from '$lib/images/projects/barangay2.png';
	import biology from '$lib/images/projects/biology.png';
	import cpu_scheduler from '$lib/images/projects/cpu-scheduler.png';
</script>

<svelte:head>
	<title>Projects</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>My Projects</h1>
	<h3>
		<a href="https://github.com/Rojhon/Sorting-Algorithm-Visualizer-in-Godot" target="_blank">Sorting Algorithm Visualizer in Godot</a>
	</h3>
	<p>
		A side project I did before for fun and learning. A sorting algorithm visualizer is like a tool that can show you how certain sorting algorithms work through animation. I implemented four different types of sorting algorithms in this side project of mine: bubble sort, insertion sort, gnome sort, and selection sort.
	</p>
	<img src={sav} alt="Sorting Algorithm Visualizer" />
	<br>
	<img src={sav2} alt="Sorting Algorithm Visualizer" />

	<h3>
		<a href="https://mitivelane-test.online/" target="_blank">Barangay System</a>
	</h3>
	<p>I developed a barangay system utilizing the MERN stack, with the aim of enhancing administrative processes and community services for multiple barangays. The system encompasses a user-friendly web-based interface, allowing efficient management of resident records, report generation, and facilitation of various barangay activities. Furthermore, a document management system was implemented to streamline the handling of barangay clearances, permits, and other official documents, resulting in a remarkable 70% reduction in paperwork.</p>
	<img src={barangay1} alt="Barangay System" />
	<br>
	<img src={barangay2} alt="Barangay System" />

	<h3>
		<a href="https://genbioscope.netlify.app/" target="_blank">Biology Learning Platform</a>
	</h3>
	<p>I developed a biology learning platform using the MERN stack, aiming to deliver an interactive and modular learning experience for students. The platform features a design that allows users to select specific topics or modules of interest, enabling personalized learning. To enhance engagement, a diverse range of interactive learning materials and quizzes were created. Additionally, a progress tracking feature was integrated to monitor students' learning journeys, ensuring a comprehensive understanding of the subject matter.</p>
	<img src={biology} alt="Biology" />
	
	<h3>
		<a href="https://github.com/Locality-PH/cpu_scheduler" target="_blank">CPU Scheduler Calculator</a>
	</h3>
	<p>I developed a CPU scheduler calculator application using React.js, which incorporates various CPU scheduling algorithms such as Priority (non-preemptive), Shortest Remaining Time First (SRTF) (preemptive), and Shortest Job First (SJF) (non-preemptive). The application also includes the ability to calculate and display the average waiting time and turnaround time on Gantt charts.</p>
	<img src={cpu_scheduler} alt="CPU Scheduler" />
</div>

<style>
	img{
		width: 100%;
		height: 100%;
	}
</style>
