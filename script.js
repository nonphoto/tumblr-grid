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

			posts.forEach(post => {
				if (post.type === 'photo') {
					post.photos.forEach(photo => {
						const tile = document.createElement('div')
						tile.classList.add('tile')

						const fullImage = photo.alt_sizes[0]
						const thumbnailImage = photo.alt_sizes[photo.alt_sizes.length - 1]

						tile.style.backgroundImage = `url(${thumbnailImage.url})`
						tile.addEventListener('click', () => {
							viewer.classList.add('is-active')
							viewerImage.src = fullImage.url
							viewerImage.dataset.href = post.post_url
						})

						fragment.appendChild(tile)
					})
				}
				else {
					const tile = document.createElement('div')
					tile.classList.add('tile')

					tile.classList.add('has-no-image')
					tile.addEventListener('click', () => {
						window.open(post.post_url, '_blank')
					})

					fragment.appendChild(tile)
				}
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

	viewer.addEventListener('click', () => {
		viewer.classList.remove('is-active')
	})

	viewerImage.addEventListener('click', (e) => {
		window.open(viewerImage.dataset.href, '_blank')
		e.stopPropagation()
	})

	window.addEventListener('scroll', () => {
		if (hasPostsRemaining && hasScrolledToBottom()) {
			loadImages()
		}
	})
})
