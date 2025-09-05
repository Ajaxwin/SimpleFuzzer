# Chat-LLM (MAIN)

<!-- Main Function level -->

1. Generate prompt for protocol states (construct_prompt_for_protocol_states) *missing function*
2. Get states of protocol (get_protocol_message_types)
    1. Repeat all these steps CONFIDENT_TIMES(3)
        1. Use LLM to generate states (chat_with_llm)
        2. Format and fix each state to make them consistent
        3. Save those states in a map of strings
    2. Update states_set with states that appear atleast more than half times the number of CONFIDENT TIMES, **to make sure that states generated are reliable.**
3. Save state seeds in in_dir (get_seeds_to_states), *missing function*
4. for _ in range(5):
    1. Construct prompt for templates of protocols, **Prompt** contains example of the protocol, prompt grammar etc to be passed to LLM (line 168)
    2. Pass these template prompts to LLM
    3. Now using the prompt and answer from above two steps generate prompt and templates for remaining templates. *How does it construct prompt is unclear*.(construct_prompt_for_remaining_templates) 
    4. Again pass the prompt to LLM
    5. Extract message grammar after combining above templates
    6. 
    <!-- continue from 1022 -->