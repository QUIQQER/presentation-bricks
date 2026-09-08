<?php

/**
 * This file contains QUI\PresentationBricks\Controls\ScrollPinnedCards
 */

namespace QUI\PresentationBricks\Controls;

use QUI;

/**
 * Class ScrollPinnedCards
 *
 * Section that pins itself while scrolling and moves large cards
 * horizontally, mapped 1:1 to the scroll progress inside a tall wrapper.
 *
 * The pin is a progressive enhancement: without JavaScript, on touch only
 * devices, on narrow viewports, with "prefers-reduced-motion" or with less
 * than two cards the very same markup renders as a plain stack of cards.
 *
 * @package quiqqer/presentation-bricks
 */
class ScrollPinnedCards extends QUI\Control
{
    /**
     * Scroll length that is spent per card while the section is pinned.
     * A bigger value means the cards travel slower.
     */
    protected const SPEED_PRESETS = [
        'slow' => '110vh',
        'normal' => '75vh',
        'fast' => '45vh'
    ];

    protected const SPEEDS = ['slow', 'normal', 'fast'];

    protected const DEFAULT_SPEED = 'normal';

    /**
     * Width of the active (centered) card as a factor of --qui-page-contentSize.
     */
    protected const CARD_WIDTH_PRESETS = [
        '60' => '0.6',
        '70' => '0.7',
        '80' => '0.8',
        '90' => '0.9'
    ];

    /**
     * The preset keys above are numeric strings and therefore stored as
     * integer array keys, so the allowed values are listed separately.
     */
    protected const CARD_WIDTHS = ['60', '70', '80', '90'];

    protected const DEFAULT_CARD_WIDTH = '80';

    protected const LAYOUTS = ['content', 'image', 'text-image', 'image-text'];

    protected const SPLIT_RATIOS = ['50-50', '60-40', '40-60'];

    protected const COUNTER_MODES = ['inline', 'hidden', 'custom'];

    protected const DEFAULT_COUNTER_MODE = 'inline';

    /**
     * Button variants of the template design system, identical to the
     * "btnType" list of the Button / Buttons bricks in quiqqer/bricks.
     */
    protected const BUTTON_TYPES = [
        'primary',
        'primary-outline',
        'secondary',
        'secondary-outline',
        'success',
        'success-outline',
        'danger',
        'danger-outline',
        'warning',
        'warning-outline',
        'info',
        'info-outline',
        'dark',
        'dark-outline',
        'light',
        'light-outline',
        'white',
        'white-outline',
        'link',
        'link-body'
    ];

    protected const LINK_TARGETS = ['_self', '_blank'];

    protected const ICON_POSITIONS = ['start', 'end'];

    /**
     * Where the text block sits inside a card. Only relevant while the section
     * is pinned: there every card is as tall as the tallest one, so a short
     * text has room left over.
     *
     * "start-actionEnd" is not a single alignment: the text stays at the top
     * and only the button is pushed to the lower edge, which lines the buttons
     * of all cards up. Every preset therefore maps to the two CSS variables
     * that produce it: the alignment of the text column and the top margin of
     * the button.
     *
     * @var array<string, array{string, string}>
     */
    protected const TEXT_POSITION_PRESETS = [
        'start' => ['start', '0'],
        'center' => ['center', '0'],
        'start-actionEnd' => ['start', 'auto']
    ];

    protected const TEXT_POSITIONS = ['start', 'center', 'start-actionEnd'];

    protected const DEFAULT_TEXT_POSITION = 'start';

    /**
     * How the image fills its area. "cover" crops, "contain" shows the
     * complete motif and may leave empty space.
     */
    protected const IMAGE_FITS = ['cover', 'contain'];

    protected const DEFAULT_IMAGE_FIT = 'cover';

    protected const DEFAULT_IMAGE_POSITION = 'center';

    /**
     * Which part of the image stays visible when it is cropped.
     */
    protected const IMAGE_POSITIONS = [
        'left top',
        'top',
        'right top',
        'left',
        'center',
        'right',
        'left bottom',
        'bottom',
        'right bottom'
    ];

    /**
     * Button size classes of the template design system, identical to the
     * "size" setting of the Button / Buttons bricks in quiqqer/bricks.
     */
    protected const BUTTON_SIZES = [
        'default' => '',
        'sm' => 'btn-sm',
        'lg' => 'btn-lg'
    ];

    protected const BUTTON_SIZE_KEYS = ['default', 'sm', 'lg'];

    protected const DEFAULT_BUTTON_SIZE = 'default';

    /**
     * Data attribute names the control sets itself and that editor data must
     * not be able to overwrite.
     */
    protected const RESERVED_DATA_ATTRIBUTES = ['data-name', 'data-qui'];

    /**
     * Below this amount of cards the pin has nothing to travel, so the
     * stacked presentation is used instead.
     */
    protected const MIN_PIN_CARDS = 2;

    /**
     * Viewport width (px) from which the pin may become active. Matches the
     * desktop breakpoint of quiqqer/template-presentation.
     */
    protected const PIN_BREAKPOINT = 1024;

    /**
     * constructor
     *
     * @param array<string, mixed> $attributes
     */
    public function __construct(array $attributes = [])
    {
        $this->setAttributes([
            'class' => 'quiqqer-presentationBricks-scrollPinnedCards qui-content-grid',
            'nodeName' => 'section',
            'entries' => [],
            'cardWidth' => '80',
            'speed' => 'normal',
            'textPosition' => self::DEFAULT_TEXT_POSITION,
            'showNumbers' => true,
            'imageMaxHeight' => '',
            'imageFit' => self::DEFAULT_IMAGE_FIT,
            'imagePosition' => self::DEFAULT_IMAGE_POSITION,
            'buttonSize' => self::DEFAULT_BUTTON_SIZE,
            'counterMode' => 'inline',
            'counterTarget' => ''
        ]);

        parent::__construct($attributes);

        $this->addCSSFile(dirname(__FILE__) . '/ScrollPinnedCards.css');
    }

    /**
     * (non-PHPdoc)
     *
     * @see \QUI\Control::create()
     *
     * @throws QUI\Exception
     */
    public function getBody(): string
    {
        $entries = $this->getEntries();

        if (empty($entries)) {
            QUI\System\Log::addWarning(
                'ScrollPinnedCards brick has no active cards, nothing rendered.',
                ['brickId' => $this->getAttribute('id')]
            );

            return '';
        }

        $cardWidth = $this->normalize('cardWidth', self::CARD_WIDTHS, self::DEFAULT_CARD_WIDTH);
        $speed = $this->normalize('speed', self::SPEEDS, self::DEFAULT_SPEED);
        $counterMode = $this->getCounterMode();
        $counterTarget = trim((string)$this->getAttribute('counterTarget'));

        $this->setCustomVariable('cardCount', (string)count($entries));
        $this->setCustomVariable('cardWidthFactor', self::CARD_WIDTH_PRESETS[$cardWidth]);
        $this->setCustomVariable('speed', self::SPEED_PRESETS[$speed]);
        $textPosition = self::TEXT_POSITION_PRESETS[
            $this->normalize('textPosition', self::TEXT_POSITIONS, self::DEFAULT_TEXT_POSITION)
        ];

        $this->setCustomVariable('textPosition', $textPosition[0]);
        $this->setCustomVariable('actionMarginTop', $textPosition[1]);

        // section wide image defaults; a card only overrides what it sets itself
        $this->setCustomVariable(
            'imageMaxHeight',
            $this->sanitizeCssLength((string)$this->getAttribute('imageMaxHeight'))
        );
        $this->setCustomVariable(
            'imageFit',
            $this->normalize('imageFit', self::IMAGE_FITS, self::DEFAULT_IMAGE_FIT)
        );
        $this->setCustomVariable(
            'imagePosition',
            $this->normalize('imagePosition', self::IMAGE_POSITIONS, self::DEFAULT_IMAGE_POSITION)
        );

        $this->setJavaScriptControl('package/quiqqer/presentation-bricks/bin/Controls/ScrollPinnedCards');
        $this->setJavaScriptControlOption('countermode', $counterMode);
        $this->setJavaScriptControlOption('countertarget', $counterMode === 'custom' ? $counterTarget : '');
        $this->setJavaScriptControlOption('breakpoint', self::PIN_BREAKPOINT);
        $this->setJavaScriptControlOption('mincards', self::MIN_PIN_CARDS);

        $Engine = QUI::getTemplateManager()->getEngine();

        $Engine->assign([
            'this' => $this,
            'cards' => $this->buildCards($entries),
            'showCounter' => $counterMode !== 'hidden',
            'counterTotal' => $this->formatNumber(count($entries))
        ]);

        return $Engine->fetch(dirname(__FILE__) . '/ScrollPinnedCards.html');
    }

    /**
     * Decoded, normalized and enabled entries in editor order.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getEntries(): array
    {
        $entries = $this->getAttribute('entries');

        if (is_string($entries)) {
            $entries = json_decode($entries, true);
        }

        if (!is_array($entries)) {
            return [];
        }

        $result = [];

        foreach ($entries as $entry) {
            if (!is_array($entry)) {
                continue;
            }

            if (!empty($entry['disabled']) || !empty($entry['isDisabled'])) {
                continue;
            }

            $result[] = $this->normalizeEntry($entry);
        }

        return $result;
    }

    /**
     * Bring one stored entry into the shape the template expects. Values
     * coming from older or hand written data are normalized here as well,
     * the backend editor is not a trust boundary.
     *
     * @param array<string, mixed> $entry
     *
     * @return array<string, mixed>
     */
    protected function normalizeEntry(array $entry): array
    {
        $layout = (string)($entry['layout'] ?? 'content');
        $splitRatio = (string)($entry['splitRatio'] ?? '50-50');
        $btnType = (string)($entry['btnType'] ?? 'primary');
        $linkTarget = (string)($entry['linkTarget'] ?? '_self');
        $iconPosition = (string)($entry['iconPosition'] ?? 'start');
        $imageFit = (string)($entry['imageFit'] ?? '');
        $imagePosition = (string)($entry['imagePosition'] ?? '');

        return [
            'layout' => in_array($layout, self::LAYOUTS, true) ? $layout : 'content',
            'splitRatio' => in_array($splitRatio, self::SPLIT_RATIOS, true) ? $splitRatio : '50-50',
            'icon' => trim((string)($entry['icon'] ?? '')),
            'eyebrow' => trim((string)($entry['eyebrow'] ?? '')),
            'title' => trim((string)($entry['title'] ?? '')),
            'image' => trim((string)($entry['image'] ?? '')),
            'imageMaxHeight' => $this->sanitizeCssLength((string)($entry['imageMaxHeight'] ?? '')),
            'imageFit' => in_array($imageFit, self::IMAGE_FITS, true) ? $imageFit : '',
            'imagePosition' => in_array($imagePosition, self::IMAGE_POSITIONS, true) ? $imagePosition : '',
            'content' => (string)($entry['content'] ?? ''),
            'buttonText' => trim((string)($entry['buttonText'] ?? '')),
            'btnType' => in_array($btnType, self::BUTTON_TYPES, true) ? $btnType : 'primary',
            'iconClass' => trim((string)($entry['iconClass'] ?? '')),
            'iconPosition' => in_array($iconPosition, self::ICON_POSITIONS, true) ? $iconPosition : 'start',
            'customClass' => $this->normalizeCustomClass($entry['customClass'] ?? ''),
            'ariaLabel' => trim((string)($entry['ariaLabel'] ?? '')),
            'dataAttributes' => $this->normalizeDataAttributes($entry['dataAttributes'] ?? []),
            'link' => $this->normalizeLink($entry['link'] ?? ''),
            'linkTarget' => in_array($linkTarget, self::LINK_TARGETS, true) ? $linkTarget : '_self',
            'linkNofollow' => !empty($entry['linkNofollow'])
        ];
    }

    /**
     * Turn the normalized entries into the view data of a single card.
     *
     * @param array<int, array<string, mixed>> $entries
     *
     * @return array<int, array<string, mixed>>
     */
    protected function buildCards(array $entries): array
    {
        $showNumbers = (bool)$this->getAttribute('showNumbers');
        $defaultButtonText = QUI::getLocale()->get(
            'quiqqer/presentation-bricks',
            'control.ScrollPinnedCards.button.default'
        );

        $cards = [];
        $position = 0;

        foreach ($entries as $entry) {
            $position++;

            $layout = (string)$entry['layout'];
            $isSplit = $layout === 'text-image' || $layout === 'image-text';
            $hasMedia = $entry['image'] !== '' && ($layout === 'image' || $isSplit);
            $hasText = $layout !== 'image';
            $hasLink = $entry['link'] !== '';
            $buttonText = $entry['buttonText'] !== '' ? $entry['buttonText'] : $defaultButtonText;

            $cards[] = [
                'layout' => $layout,
                'splitRatio' => $isSplit ? (string)$entry['splitRatio'] : '',
                'number' => $this->formatNumber($position),
                'showNumber' => $showNumbers && $hasText,
                'hasMedia' => $hasMedia,
                'image' => $entry['image'],
                'cardStyle' => $this->buildCardStyle($entry),
                'hasText' => $hasText,
                'icon' => $entry['icon'],
                'hasIcon' => $entry['icon'] !== '',
                'iconIsImage' => QUI\Projects\Media\Utils::isMediaUrl($entry['icon']),
                'eyebrow' => $entry['eyebrow'],
                'title' => $entry['title'],
                'content' => $entry['content'],
                'hasButton' => $hasLink,
                'buttonText' => $buttonText,
                'buttonClass' => $this->buildButtonClass($entry),
                'buttonIcon' => $entry['iconClass'],
                'buttonIconPosition' => $entry['iconPosition'],
                'buttonAriaLabel' => $entry['ariaLabel'],
                'buttonDataAttributes' => $entry['dataAttributes'],
                'link' => $entry['link'],
                'linkTarget' => $entry['linkTarget'],
                'linkRel' => $this->buildLinkRel($entry)
            ];
        }

        return $cards;
    }

    /**
     * Per card style: only the image options this card sets itself are
     * written as entry level CSS variables. Everything it leaves empty falls
     * through to the section wide setting in the stylesheet.
     *
     * @param array<string, mixed> $entry
     */
    protected function buildCardStyle(array $entry): string
    {
        $declarations = [];

        if ($entry['imageMaxHeight'] !== '') {
            $declarations[] = '--_q-entry-imageMaxHeight: ' . $entry['imageMaxHeight'];
        }

        if ($entry['imageFit'] !== '') {
            $declarations[] = '--_q-entry-imageFit: ' . $entry['imageFit'];
        }

        if ($entry['imagePosition'] !== '') {
            $declarations[] = '--_q-entry-imagePosition: ' . $entry['imagePosition'];
        }

        if ($declarations === []) {
            return '';
        }

        return htmlspecialchars(implode('; ', $declarations), ENT_QUOTES);
    }

    /**
     * Sanitize an editor entered CSS length. A bare number becomes pixels,
     * values with a unit (px, %, rem, ...) are kept, anything else returns an
     * empty string so the CSS fallback applies.
     */
    protected function sanitizeCssLength(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?[a-zA-Z%]*$/', $value) !== 1) {
            return '';
        }

        if (preg_match('/^[0-9]+(?:\.[0-9]+)?$/', $value) === 1) {
            return $value . 'px';
        }

        return $value;
    }

    /**
     * Full class attribute of the card button: the design system base class,
     * the colour variant, the global size and the editor's own classes.
     *
     * @param array<string, mixed> $entry
     */
    protected function buildButtonClass(array $entry): string
    {
        $size = $this->normalize('buttonSize', self::BUTTON_SIZE_KEYS, self::DEFAULT_BUTTON_SIZE);

        $classes = [
            'btn',
            'btn-' . $entry['btnType'],
            self::BUTTON_SIZES[$size],
            'quiqqer-presentationBricks-scrollPinnedCards__cardButton',
            (string)$entry['customClass']
        ];

        return implode(' ', array_filter($classes, static fn(string $class): bool => $class !== ''));
    }

    /**
     * Reduce the editor's custom class input to plain, space separated class
     * names so nothing can break out of the class attribute.
     *
     * @param mixed $customClass
     */
    protected function normalizeCustomClass(mixed $customClass): string
    {
        if (!is_string($customClass)) {
            return '';
        }

        $classes = preg_split('/\s+/', trim($customClass), -1, PREG_SPLIT_NO_EMPTY);
        $result = [];

        foreach ($classes ?: [] as $class) {
            if (preg_match('/^[A-Za-z_-][A-Za-z0-9_-]*$/', $class)) {
                $result[] = $class;
            }
        }

        return implode(' ', $result);
    }

    /**
     * Normalize the data attributes coming from the DataAttributes control:
     * a JSON list of {name, value} pairs. Only real data-* names pass, and the
     * attributes this control sets itself cannot be overwritten.
     *
     * @param mixed $dataAttributes
     *
     * @return array<int, array{name: string, value: string}>
     */
    protected function normalizeDataAttributes(mixed $dataAttributes): array
    {
        if (is_string($dataAttributes)) {
            $dataAttributes = json_decode($dataAttributes, true);
        }

        if (!is_array($dataAttributes)) {
            return [];
        }

        $result = [];

        foreach ($dataAttributes as $attribute) {
            if (!is_array($attribute)) {
                continue;
            }

            $name = strtolower(trim((string)($attribute['name'] ?? '')));
            $value = $attribute['value'] ?? '';

            if (!preg_match('/^data-[a-z0-9][a-z0-9_-]*$/', $name)) {
                continue;
            }

            if (in_array($name, self::RESERVED_DATA_ATTRIBUTES, true)) {
                continue;
            }

            if (!is_scalar($value) || is_bool($value)) {
                continue;
            }

            $result[] = [
                'name' => $name,
                'value' => (string)$value
            ];
        }

        return $result;
    }

    /**
     * Counter placement. A custom placement without a container name would
     * silently swallow the counter, so it falls back to the built in one.
     */
    protected function getCounterMode(): string
    {
        $mode = $this->normalize('counterMode', self::COUNTER_MODES, self::DEFAULT_COUNTER_MODE);

        if ($mode !== 'custom') {
            return $mode;
        }

        if (trim((string)$this->getAttribute('counterTarget')) !== '') {
            return 'custom';
        }

        QUI\System\Log::addWarning(
            'ScrollPinnedCards brick uses the custom counter position without a container name,'
            . ' falling back to the built in position.',
            ['brickId' => $this->getAttribute('id')]
        );

        return 'inline';
    }

    /**
     * Build the rel attribute of the card link. "noopener noreferrer" is
     * mandatory for a new tab, "nofollow" is an editor decision.
     *
     * @param array<string, mixed> $entry
     */
    protected function buildLinkRel(array $entry): string
    {
        $rel = [];

        if (!empty($entry['linkNofollow'])) {
            $rel[] = 'nofollow';
        }

        if ($entry['linkTarget'] === '_blank') {
            $rel[] = 'noopener';
            $rel[] = 'noreferrer';
        }

        return implode(' ', $rel);
    }

    /**
     * Accept an internal link (as stored by the site input) and http(s) URLs
     * only. Everything else - javascript:, data:, malformed values - becomes
     * an empty string, which removes the button and the card link.
     *
     * @param mixed $link
     */
    protected function normalizeLink(mixed $link): string
    {
        if (!is_string($link)) {
            return '';
        }

        $link = trim($link);

        if ($link === '' || preg_match('/[\x00-\x20\x7F]/', $link)) {
            return '';
        }

        $scheme = parse_url($link, PHP_URL_SCHEME);

        if ($scheme === false) {
            return '';
        }

        if ($scheme === null) {
            return $link;
        }

        if (!in_array(strtolower($scheme), ['http', 'https'], true)) {
            return '';
        }

        $host = parse_url($link, PHP_URL_HOST);

        if (!is_string($host) || $host === '') {
            return '';
        }

        return $link;
    }

    /**
     * Two digit card number: 1 becomes "01", 12 stays "12".
     */
    protected function formatNumber(int $number): string
    {
        return str_pad((string)$number, 2, '0', STR_PAD_LEFT);
    }

    /**
     * Return an attribute value only if it is part of the allowed list,
     * otherwise fall back to the given default.
     *
     * @param string $attribute
     * @param array<int, string> $allowed
     * @param string $default
     *
     * @return string
     */
    protected function normalize(string $attribute, array $allowed, string $default): string
    {
        $value = (string)$this->getAttribute($attribute);

        if (in_array($value, $allowed, true)) {
            return $value;
        }

        return $default;
    }

    /**
     * Write a control config CSS variable to the root element style. The CSS
     * picks it up via the long, themeable variable as a fallback layer.
     *
     * @param string $name
     * @param string $value
     *
     * @return void
     */
    private function setCustomVariable(string $name, string $value): void
    {
        if ($name === '' || $value === '') {
            return;
        }

        $this->setStyle('--_q-controlConf-' . $name, $value);
    }
}
