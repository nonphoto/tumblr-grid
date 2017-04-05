const apiKey = 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8'
const postLimit = 50
const scrollThreshold = 100

let username = null
let postCount = 0
let lastPostTimestamp = 0
let isLoading = false
let hasPostsRemaining = true

let hint = null
let spinner = null
let form = null
let formText = null
let viewer = null
let viewerImage = null
let tileContainer = null

function loadImages() {
	if (!username) return
	if (isLoading) return
	if (!hasPostsRemaining) return

	isLoading = true

	spinner.classList.add('is-visible')

	const onLoadEnd = () => {
		spinner.classList.remove('is-visible')
		isLoading = false
	}

	let params = {
		api_key: apiKey,
		limit: postLimit,
	}

	if (postCount <= 1000) {
		params.offset = postCount
	}
	else {
		params.before = lastPostTimestamp
	}

	console.log(postCount)

	axios.get(`https://api.tumblr.com/v2/blog/${username}.tumblr.com/likes`, { params })
		.then((response) => {

			const fragment = document.createDocumentFragment()
			const posts = response.data.response.liked_posts

			if (posts.length <= 0) {
				hasPostsRemaining = false
				onLoadEnd()
				return
			}

			posts.forEach((post) => {
				const tile = document.createElement('div')
				tile.classList.add('tile')

				if (post.type === 'photo') {
					const images = post.photos[0].alt_sizes
					const image = images.filter(image => image.width === 75)[0]
					tile.style.backgroundImage = `url(${image.url})`
				}

				fragment.appendChild(tile)
			})

			lastPostTimestamp = posts[posts.length - 1].timestamp
			postCount += postLimit
			tileContainer.appendChild(fragment)

			onLoadEnd()

			if (hasScrolledToBottom()) {
				loadImages()
			}
		})
		.catch((error) => {
			console.error(error)
			onLoadEnd()
		})
}

function hasScrolledToBottom() {
	return (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - scrollThreshold)
}

document.addEventListener('DOMContentLoaded', () => {
	hint = document.getElementById('hint')
	spinner = document.getElementById('spinner')
	form = document.getElementById('form-username')
	formText = document.getElementById('text-username')
	viewer = document.getElementById('viewer')
	viewerImage = document.getElementById('viewer-image')
	tileContainer = document.getElementById('tile-container')

	form.addEventListener('submit', () => {
		hint.classList.add('is-hidden')
		username = formText.value
		loadImages()
		return false
	})

	window.addEventListener('scroll', () => {
		if (hasPostsRemaining && hasScrolledToBottom()) {
			loadImages()
		}
	})
})
