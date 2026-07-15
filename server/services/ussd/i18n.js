const translations = {
  en: {
    choose_language: `Choose Language

1. English
2. Kiswahili`,

    invalid_language_option: `Invalid option

Choose Language

1. English
2. Kiswahili`,

    welcome_menu: `Welcome to Mctaba CRM

1. Register
2. My Details
3. New Support Ticket
0. Exit`,

    account_menu_greeting: "You are already registered. Welcome back",

    account_menu_options: `1. My Details
2. New Support Ticket
0. Main Menu`,

    invalid_account_menu_option: "Invalid option.",

    enter_full_name: "Enter your full name",

    enter_id_number: "Enter your ID Number",

    enter_phone_number: "Enter your phone number",

    invalid_id_number: `Invalid ID Number.

Enter 5 to 12 digits`,

    registration_successful: "Registration successful!",

    already_registered: "You are already registered.",

    registration_session_error:
      "Your registration session expired. Please dial again.",

    not_registered: "You are not registered. Please register first.",

    crm_record_not_found: "No CRM record was found for this phone number.",

    not_available: "Not available",

    name_label: "Name",

    status_label: "Status",

    category_label: "Category",

    details_back_option: "0. Back",

    invalid_details_option: `Invalid option.

Enter 0 to go back.`,

    ticket_category_menu: `Select category

1. Billing
2. Product Quality
3. Delivery
4. Other
0. Back`,

    invalid_ticket_category: `Invalid option

Select category

1. Billing
2. Product Quality
3. Delivery
4. Other
0. Back`,

    describe_problem: "Describe your problem",

    ticket_message_too_short: `Message too short.

Describe your problem using at least 3 characters`,

    ticket_received: "Your support ticket has been received.",

    ticket_reference_label: "Reference",

    ticket_sms_confirmation:
      "Mctaba CRM: Ticket {reference} received. Category: {category}. An agent will contact you.",

    invalid_main_option: `Invalid option

1. Register
2. My Details
3. New Support Ticket
0. Exit`,

    exit_message: "Thank you for using Mctaba CRM.",
  },

  sw: {
    choose_language: `Chagua Lugha

1. English
2. Kiswahili`,

    invalid_language_option: `Chaguo si sahihi

Chagua Lugha

1. English
2. Kiswahili`,

    welcome_menu: `Karibu Mctaba CRM

1. Jisajili
2. Maelezo Yangu
3. Fungua Ombi la Usaidizi
0. Toka`,

    account_menu_greeting: "Tayari umesajiliwa. Karibu tena",

    account_menu_options: `1. Maelezo Yangu
2. Fungua Ombi la Usaidizi
0. Menyu Kuu`,

    invalid_account_menu_option: "Chaguo si sahihi.",

    enter_full_name: "Weka jina lako kamili",

    enter_id_number: "Weka nambari yako ya kitambulisho",

    enter_phone_number: "Weka nambari yako ya simu",

    invalid_id_number: `Nambari ya Kitambulisho si sahihi.

Weka tarakimu 5 hadi 12`,

    registration_successful: "Usajili umefanikiwa!",

    already_registered: "Tayari umesajiliwa.",

    registration_session_error: "Muda wa usajili umeisha. Tafadhali piga tena.",

    not_registered: "Hujasajiliwa. Tafadhali jisajili kwanza.",

    crm_record_not_found:
      "Hakuna rekodi ya CRM iliyopatikana kwa nambari hii ya simu.",

    not_available: "Haipatikani",

    name_label: "Jina",

    status_label: "Hali",

    category_label: "Aina",

    details_back_option: "0. Rudi",

    invalid_details_option: `Chaguo si sahihi.

Weka 0 kurudi.`,

    ticket_category_menu: `Chagua aina ya tatizo

1. Malipo
2. Ubora wa Bidhaa
3. Uwasilishaji
4. Nyingine
0. Rudi`,

    invalid_ticket_category: `Chaguo si sahihi

Chagua aina ya tatizo

1. Malipo
2. Ubora wa Bidhaa
3. Uwasilishaji
4. Nyingine
0. Rudi`,

    describe_problem: "Eleza tatizo lako",

    ticket_message_too_short: `Ujumbe ni mfupi sana.

Eleza tatizo lako kwa kutumia angalau herufi 3`,

    ticket_received: "Ombi lako la usaidizi limepokelewa.",

    ticket_reference_label: "Kumbukumbu",

    ticket_sms_confirmation:
      "Mctaba CRM: Ombi {reference} limepokelewa. Aina: {category}. Mhudumu atawasiliana nawe.",

    invalid_main_option: `Chaguo si sahihi

1. Jisajili
2. Maelezo Yangu
3. Fungua Ombi la Usaidizi
0. Toka`,

    exit_message: "Asante kwa kutumia Mctaba CRM.",
  },
};

function t(language, key) {
  const selectedLanguage = translations[language] || translations.en;

  return selectedLanguage[key] || translations.en[key] || "Message unavailable";
}

module.exports = {
  t,
};
