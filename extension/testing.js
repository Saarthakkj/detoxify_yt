const { GoogleGenerativeAI } = require("@google/generative-ai");
const {system_prompt , padding} = require("./utils");
import 'dotenv/config';

gemini = os.environ['GEMINI_GENERATIVE_LANGUAGE_CLIENT_API'];

genai.configure(api_key=gemini)


cache = caching.CachedContent.create(
    model='models/gemini-1.5-flash-001',
    system_instruction=system_prompt + padding
)


model = genai.GenerativeModel.from_cached_content(cached_content=cache)
response = model.generate_content("Generate a title for a youtube video about ")
console.log(response);
