<script setup lang="ts">
// In-script components using the composable approach
const heroTitle = useKatzeText({
  key: 'hero_title',
  default: 'The future of content editing is here',
})

const heroSubtitle = useKatzeText({
  key: 'hero_subtitle',
  default: 'Simple. Fast. Flexible.',
})

// Sample data for features section
const features = [
  {
    title: 'Simple Integration',
    description: 'Add content management to your site with just a few lines of code. No complex setup required.',
    icon: 'puzzle-piece',
  },
  {
    title: 'Real-time Editing',
    description: 'Edit your content directly on your site and see changes instantly. No more switching between tools.',
    icon: 'zap',
  },
  {
    title: 'Developer Friendly',
    description: 'Built with developers in mind. Works with your existing tech stack and workflow.',
    icon: 'code',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <!-- Header with Katze logo -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <!-- Katze logo from navigation -->
          <svg
            width="36px"
            height="36px"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M374.762,186.866h0a54.1,54.1,0,0,0-51.305-36.706H280V21.552l-18.263,2.609c-41.429,5.918-73.7,26.912-95.907,62.4-16.011,25.581-23.454,53.8-26.908,74.906-23.847,18.348-44.593,43.611-61.738,75.2-14.449,26.618-26.41,57.816-35.552,92.729-15.447,58.99-17.538,107.921-17.619,109.975L24.005,496H56V440.364c.4-8.231,10.476-188.35,107.032-256.936l5.66-4.021.93-6.881C174.437,136.9,191.077,78.058,248,59.971V182.16h75.457a22.12,22.12,0,0,1,21,14.974h0c12.757,37.656,34.677,84.777,68.839,106.921l-10.274,38.528a62.688,62.688,0,0,1-62.54,46.87c-28.668-.86-58.506,2.88-88.689,11.111L240,403.779V496h32V428.468a265.353,265.353,0,0,1,67.52-7.03,94.97,94.97,0,0,0,94.418-70.61l17.088-64.081L438.3,281.293C414.5,271.093,391.936,237.558,374.762,186.866Z"
              fill="#4f46e5"
            />
          </svg>
          <h1 class="text-xl font-semibold text-indigo-600">
            Katze CMS
          </h1>
        </div>
        <div class="flex items-center space-x-4">
          <a
            href="#features"
            class="text-gray-600 hover:text-gray-900"
          >Features</a>
          <a
            href="#examples"
            class="text-gray-600 hover:text-gray-900"
          >Examples</a>
          <a
            href="https://github.com/maxschleining"
            class="text-gray-600 hover:text-gray-900"
          >GitHub</a>
          <button class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Get Started
          </button>
        </div>
      </div>
    </header>

    <!-- Hero section with editable content -->
    <div class="relative overflow-hidden bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main class="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div class="sm:text-center lg:text-left">
              <KatzeText
                id="hero_title"
                element="h2"
                class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                default-content="The future of content editing is here"
              >
                {{ heroTitle }}
              </KatzeText>
              <KatzeText
                id="hero_subtitle"
                element="p"
                class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                default-content="Simple. Fast. Flexible."
              >
                {{ heroSubtitle }}
              </KatzeText>
              <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div class="rounded-md shadow">
                  <a
                    href="#"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Try it now
                  </a>
                </div>
                <div class="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#"
                    class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                  >
                    Documentation
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <KatzeImage
          id="hero_image"
          default-src="https://placehold.co/600x400"
          default-alt="place holder image"
          class="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
        />
      </div>
    </div>

    <!-- Feature blocks -->
    <div
      id="features"
      class="py-12 bg-white"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <KatzeText
            id="features_title"
            element="h2"
            default-content="Content management has never been easier"
            class="text-3xl font-extrabold text-gray-900"
          />
          <KatzeText
            id="features_subtitle"
            element="p"
            class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4"
            default-content="Edit your content right on your website, no admin panels needed"
          />
        </div>

        <div class="mt-10">
          <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="pt-6"
            >
              <div class="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div>
                    <span class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <svg
                        class="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                    </span>
                  </div>
                  <KatzeText
                    :id="`feature_title_${index}`"
                    :default-content="feature.title"
                    element="h3"
                    class="mt-8 text-lg font-medium text-gray-900 tracking-tight"
                  />
                  <KatzeText
                    :id="`feature_desc_${index}`"
                    element="p"
                    class="mt-5 text-base text-gray-500"
                    :default-content="feature.description"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Example section -->
    <div
      id="examples"
      class="py-16 bg-gray-50 overflow-hidden"
    >
      <div class="max-w-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8">
        <div class="text-center">
          <KatzeText
            id="examples_heading"
            element="h2"
            default-content="Examples"
            class="text-base font-semibold text-indigo-600 tracking-wide uppercase"
          />
          <KatzeText
            id="examples_title"
            element="h3"
            class="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight"
            default-content="See it in action"
          />
          <KatzeText
            id="examples_subtitle"
            element="p"
            class="max-w-xl mt-5 mx-auto text-xl text-gray-500"
            default-content="Simple components that make content management a breeze"
          />
        </div>

        <!-- Component examples -->
        <div class="mt-12 bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              KatzeText Component
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Simple text editing for headlines, paragraphs, and more.
            </p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div class="bg-gray-50 p-4 rounded-md">
              <KatzeText
                id="example_text"
                default-content="This text can be edited directly on the page. Click to edit!"
                class="text-xl font-medium text-gray-900"
              />
            </div>
            <div class="mt-4 bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre class="text-sm text-gray-800">
&lt;KatzeText
  id="example_text"
  default-content="This text can be edited directly on the page. Click to edit!"
  class="text-xl font-medium text-gray-900"
/&gt;</pre>
            </div>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              KatzeRichText Component
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Rich text editing for formatted content with HTML support.
            </p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div class="bg-gray-50 p-4 rounded-md">
              <KatzeRichText
                id="example_rich_text"
                default-content="<p>This is <strong>rich text</strong> that supports <em>formatting</em>, <u>underlining</u>, and even <a href='#'>links</a>!</p><p>Edit me to see the magic happen.</p>"
                class="prose max-w-none"
              />
            </div>
            <div class="mt-4 bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre class="text-sm text-gray-800">
&lt;KatzeRichText
  id="example_rich_text"
  default-content="&lt;p&gt;This is &lt;strong&gt;rich text&lt;/strong&gt; that supports &lt;em&gt;formatting&lt;/em&gt;...&lt;/p&gt;"
  class="prose max-w-none"
/&gt;</pre>
            </div>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              KatzeImage Component
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Easy image management with on-the-fly replacements.
            </p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="flex justify-center">
                <KatzeImage
                  id="example_image"
                  default-src="/test.svg"
                  default-alt="Example image that can be replaced"
                  class="max-w-md rounded-lg shadow-md"
                />
              </div>
            </div>
            <div class="mt-4 bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre class="text-sm text-gray-800">
&lt;KatzeImage
  id="example_image"
  default-src="/test.svg"
  default-alt="Example image that can be replaced"
  class="max-w-md rounded-lg shadow-md"
/&gt;</pre>
            </div>
          </div>
        </div>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              In-Script Components
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Use composables for reactive content in your script section.
            </p>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div class="bg-gray-50 p-4 rounded-md">
              <p class="text-lg font-medium">
                Current value: {{ heroTitle }}
              </p>
            </div>
            <div class="mt-4 bg-gray-100 p-4 rounded-md overflow-x-auto">
              <pre class="text-sm text-gray-800">
&lt;script setup lang="ts"&gt;
const heroTitle = useKatzeText({
  key: 'hero_title',
  default: 'The future of content editing is here',
})
&lt;/script&gt;

&lt;template&gt;
  &lt;p&gt;Current value: {{ '\{\{ heroTitle \}\}' }}&lt;/p&gt;
&lt;/template&gt;</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA section -->
    <div class="bg-indigo-700">
      <div class="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <KatzeText
          id="cta_title"
          element="h2"
          default-content="Ready to simplify your content management?"
          class="text-3xl font-extrabold text-white sm:text-4xl"
        />
        <KatzeText
          id="cta_text"
          element="p"
          default-content="Katze CMS is free and open-source. Get started today and take control of your content."
          class="mt-4 text-lg leading-6 text-indigo-200"
        />
        <a
          href="#"
          class="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
        >
          Get started
        </a>
        <a
          href="#"
          class="mt-8 ml-4 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70 sm:w-auto"
        >
          Documentation
        </a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white">
      <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div class="mt-8 flex justify-center space-x-6">
          <a
            href="#"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">GitHub</span>
            <svg
              class="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>
        <p class="mt-8 text-center text-base text-gray-500">
          Katze CMS is created by <a
            href="https://github.com/maxlkatze"
            class="text-indigo-600 hover:text-indigo-500"
          >Max Schleining</a>. Free and open-source.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Adding some minimal styles */
html {
  scroll-behavior: smooth;
}

a {
  color: #4f46e5;
  text-decoration: none;
}
</style>
