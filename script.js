const apiKey = 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8'
const postLimit = 50
const scrollThreshold = 100

let params = {
	api_key: apiKey,
	limit: postLimit,
}

let username = null
let postCount = 0
let lastPostTimestamp = 0
let isLoading = false
let hasPostsRemaining = true

function loadImages() {
	if (!username) return
	if (isLoading) return
	if (!hasPostsRemaining) return

	isLoading = true

	const spinner = document.getElementById('spinner')
	spinner.classList.add('is-visible')

	const onLoadEnd = () => {
		spinner.classList.remove('is-visible')
		isLoading = false
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

			const container = document.getElementById('tile-container')
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
			container.appendChild(fragment)

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

function onScroll() {
	if (hasPostsRemaining && hasScrolledToBottom()) {
		loadImages()
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const hint = document.getElementById('hint')
	const form = document.getElementById('form-username')
	const formText = document.getElementById('text-username')
	form.addEventListener('submit', () => {
		hint.classList.add('is-hidden')
		username = formText.value
		loadImages()
		return false
	})

	window.addEventListener('scroll', onScroll)
})
