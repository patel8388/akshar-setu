# Font catalog and mapping availability

## Source names, not converter internals

The catalog contains the public selector labels from [Font Converter Online's Gujarati Tera converter](https://www.fontconverter.online/gujarati/gujarati-unicode-tera-font-converter) and [Pramukh Gujarati Font Converter](https://www.pramukhfontconverter.com/gujarati). Only font names and reference URLs were used. Neither site's converter code, tables, subscription service, or font files is included.

There are **104 distinct labels/versions**: 31 from Font Converter Online and 94 unique from Pramukh, with 21 exact overlaps. Pramukh's selector repeats `Krishna (Version 1)` with different underlying values; this catalog cannot establish which version those values represent and retains one label rather than inventing a version. Combined names such as `Akruti Guj Shyama | ACSC` are preserved as source labels, not independently validated encoding equivalences.

## Bundled mappings: none

No verified, redistributable mapping pack for these listed legacy fonts has been established in this update. Every catalog entry is marked `map-unavailable`. A missing map must never fall back to a different family's encoding.

Publicly visible code or tables do not by themselves grant permission to copy and redistribute them:

- [RahulThakor/GujaratiFontConverter](https://github.com/RahulThakor/GujaratiFontConverter) contains Gujarati conversion material but has no declared repository license in its top-level files. Its code, spreadsheet, tables, and fonts were not reused.
- [kaupage/Unicode2Saral](https://github.com/kaupage/Unicode2Saral) exposes a Saral conversion project, but its [repository metadata](https://api.github.com/repos/kaupage/Unicode2Saral) reports no license. No material was reused.
- [GujaratiLexicon/ascii2unicode](https://github.com/gujaratilexicon/ascii2unicode) is described as a Kannada ASCII converter, not a Gujarati legacy map. It was not reused.
- [Anirdesh's Harikrishna-like font converter](https://www.anirdesh.com/gujarati/unicode-to-hari.php) provides a useful public description of related fonts, but the fetched converter page does not grant a redistribution license for its conversion implementation. No code or tables were reused.

An additional lead, [dipbhi/font-transform](https://github.com/dipbhi/font-transform), does contain a Gujarati Terafont Kinnari map under an explicit [MIT license](https://raw.githubusercontent.com/dipbhi/font-transform/master/LICENSE), copyright Dipen Bhikadya, 2017. It is legally reusable under that notice, but it is **not enabled or bundled here** because the [raw JSON](https://raw.githubusercontent.com/dipbhi/font-transform/master/static/mapping/terafont-kinnari.json) assigns the same legacy `/` key to two different Unicode values (`ળ` and `ુ`), contains an empty mapping, and supplies script-ordering metadata that needs separate validation. The published backward-marker rule also does not match its translated value. No exact font build or authentic expected-output fixture is provided. A permissive license does not establish conversion correctness; this remains an experimental research lead until those issues are resolved against authorized font specimens.

Other open-license converter leads were not Gujarati maps: [legacy-font-converter on PyPI](https://pypi.org/project/legacy-font-converter/) is Bangla-focused, and [deepakkamboj/indianlanguageconverter](https://github.com/deepakkamboj/indianlanguageconverter) lists Hindi/Nepali converters with mixed MIT/GPL component notices. Neither supplies a verified mapping for the requested Gujarati catalog.

Open-license **Unicode typefaces** are not legacy encoding maps. Shipping a Unicode font would not make a Terafont, LMG, Gopika, or other legacy encoding decodable.

## Before a real font may be marked supported

1. Obtain an explicit reuse/redistribution license or the owner's written permission for the mapping data and any code. Retain provenance and required notices.
2. Identify the exact font family, version, and encoding; do not assume similarly named fonts are interchangeable.
3. Implement any needed font-specific ordering rules, not just character substitution.
4. Add expected-output fixtures for vowels, pre-base vowel signs, conjuncts, reph, punctuation, digits, mixed text, and both conversion directions. Test against authentic material with a knowledgeable Gujarati reader.
5. Bundle the licensed map and tests, then change only that exact font's availability status. Document residual ambiguity or unsupported sequences.

A user may import an authorized local JSON pack for private use now. The app validates the schema, not the ownership, completeness, or linguistic correctness of that pack.
