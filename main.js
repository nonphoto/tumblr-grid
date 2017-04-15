const scrollThreshold = 100
const postLimit = 50

const params = {
	api_key: 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8',
	limit: postLimit
}

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

function request(url, params) {
	params.callback = 'requestCallback'
	const queryString = Object
		.entries(params)
		.reduce((acc, val) => {
			acc.push(`${val[0]}=${val[1]}`)
			return acc
		}, [])
		.join('&')

	const src = `${url}?${queryString}`

	const promise = new Promise((resolve, reject) => {
		window.requestCallback = (data) => {
			window.requestCallback = undefined
			resolve(data)
		}

		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.async = true
		script.src = src

		const head = document.getElementsByTagName('head')[0]
		head.appendChild(script)
	})

	return promise
}

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

	if (postCount <= 1000) {
		params.offset = postCount
		params.before = undefined
	}
	else {
		params.offset = undefined
		params.before = lastPostTimestamp
	}

	request(`https://api.tumblr.com/v2/blog/${username}.tumblr.com/likes`, params)
		.then((data) => {

			const fragment = document.createDocumentFragment()
			const posts = data.response.liked_posts

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
		postCount = 0
		lastPostTimestamp = 0
		hasPostsRemaining = true

		while (tileContainer.firstChild) {
			tileContainer.removeChild(tileContainer.firstChild)
		}

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
