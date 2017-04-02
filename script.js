const apiKey = 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8'
const postLimit = 50
const scrollThreshold = 20

let username = null
let postCount = 0
let isLoading = false

function loadImages() {
	if (!username) return
	if (isLoading) return

	const onLoadEnd = () => {
		spinner.classList.remove('is-visible')
		isLoading = false
	}

	const spinner = document.getElementById('spinner')
	spinner.classList.add('is-visible')

	isLoading = true
	axios.get(`https://api.tumblr.com/v2/blog/${username}.tumblr.com/likes`, {
		params: {
			api_key: apiKey,
			limit: postLimit,
			offset: postCount
		},
	})
		.then((response) => {
			const container = document.getElementById('tile-container')
			const fragment = document.createDocumentFragment()
			const posts = response.data.response.liked_posts
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

			container.appendChild(fragment)
			postCount += postLimit

			onLoadEnd()

			if (hasScrolledToBottom()) {
				loadImages(username)
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
	if (hasScrolledToBottom()) {
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
