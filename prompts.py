initial_prompt = """
You are an empathetic photographer's assistant. Your role is to understand the user's input text 
------ USER's INPUT TEXT ------
{users_input} 
------ END OF USER's INPUT TEXT ------
and input image together, interpret the partcipant's story and emotions, and imagine an alternative possibility for them to use with a stable diffusion model that is able to edit the image.

Translate this alternative reality into a short and clear image image generation prompt that gives a short clear instruction to this image generation model.
Example:
a lonely boy celebrating birthday alone --> "put friends around the boy celebrating"
a broken hearted girl who submitted a photo when she was still in a couple --> remove the boy from the picture.

If needed identify the specific target objects for modification (e.g., “the boy standing in the center" 
Do not suggest color changes.
Just give me the prompt. No other text.
"""

user_inputs = [
    "I am working in a remote country where it's hard to fit in. I celebrated my birthday alone. I miss my friends and family.",
    "I’ve broken up with my boyfriend, and I feel heartbroken every time I see this photo.",
    "I finished my studies during the pandemic lockdown, and I did not have a graduation ceremony with my best friends from university. I always felt sad about that.",
    "I have always dreamed of traveling or studying abroad to experience different lifestyles, but l have never left my hometown.",
    "I’m so tired of the everyday routine. Just studying, eating, and sleeping... I wish I had some magic to make things different.",
    "I grew up in a poor rural family. My dad was sick, and my mom worked all the time, so I had to stay home and do the housework instead of going to school. I was so envious seeing my friends in their school uniforms. My dream back then was just to have my own uniform and see what school was like.",
    "This is one of my favorite photos, but I always feel like something’s missing. I’ve always been just an ordinary guy—kind of a rule-follower. Never had a rebellious phase or anything. I just wish I could be cooler!",
    "He was my first love. At that time, we were too scared of being judged. No holding hands in public, and we didn't dare take intimate photos together.",
    "He was my first love. At that time, we were too scared of being judged. No holding hands in public, and we didn't dare take intimate photos together.",
    "Aldo was my best friend, and he passed away last month. I miss him so much. This is our last photo together...",
    "One of my happiest moments was my coming-of-age ceremony with amazing photos. But I don’t want to see Amy again—the girl in the pink dress on the right. She used to be my friend, but she hurt me.",
    "One of my happiest moments was my coming-of-age ceremony with amazing photos. But I don’t want to see Amy again—the girl in the pink dress on the right. She is my sister and we grow up together, but she hurt me.",
    "This is my grandma, she has been in a wheelchair for 10 years. She used to love travel and adventure.",
    "I once had a cute poodle Alice, but unfortunately, I didn’t have a photo with it until it died, I really want to see it with me.",
    "Last year, I was seriously ill and almost died. But I recovered. A couple of days ago, I went to the beach, the sea breeze and sunshine felt amazing. It just feels so good to be alive and healthy.",
    "This is my daughter. She’s been overwhelmed with work lately and comes home exhausted every day. It really breaks my heart to see her like this.",
    "This is Lucky. He was the best dog ever, but he passed away. We miss him a lot. I just hope he’s happy wherever he is.",
    "Not long ago, I went hiking with my sister. It was such a wonderful experience.",
    "I wait for the bus here every morning. A few days ago, I ran into a friend who took this photo of me. He said I looked energetic, but I’m not sure…",
    "Recently, I passed through a village and met a kind girl there. She showed me the way. What struck me was that she looked only in her teens, yet she was taking care of three little boys. She said they were her younger brothers. I didn’t know what to say, I was just really shocked and moved.",
    "I’m just an ordinary person, nothing special. I drink black coffee and wear black clothes.",
    "This is me. I’m old now.",
    "This is my daughter’s ride-on car. She loves it. When I was a kid, my family couldn’t afford things like this. But my grandpa made me a rocking horse himself. It got lost when we moved. I’m missing it."
]

images = [
    "ori_birthdayBoy.png",
    "ori_couple.png",
    "ori_COVID19.png",
    "ori_goAboradBoy.png",
    "ori_normalGirl.png",
    "ori_pipeline.png",
    "ori_popcornBoy.png",
    "ori_queer1.png",
    "ori_queer2.png",
    "ori_twoBoys.png",
    "ori_twoGirls.png",
    "ori_grandma.png",
    "ori_runningGirl.png",
    "ori_smileGirl.png",
    "ori_tiredGirl.png",
    "ori_coupleWithDog.png",
    "ori_hikingCouple.png",
    "ori_asianMan.png",
    "ori_manyBrotherGirl.png",
    "ori_normalBoy.png",
    "ori_oldLady.png",
    "ori_oldToy.png"
]