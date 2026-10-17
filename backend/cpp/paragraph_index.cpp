#include "paragraph_index.hpp"
#include <cctype>

namespace draftwell {

namespace {

std::uint64_t fnv1a_64(const std::string& data) {
    std::uint64_t hash = 14695981039346656037ull;
    for (unsigned char c : data) {
        hash ^= c;
        hash *= 1099511628211ull;
    }
    return hash;
}

}  // namespace

ParagraphIndexer::ParagraphIndexer(const std::string& content)
    : hash_(fnv1a_64(content))
{
    if (content.empty()) {
        return;
    }

    std::size_t start = 0;
    std::size_t index = 0;
    const std::size_t n = content.size();

    for (std::size_t i = 0; i <= n; ++i) {
        const bool is_end = (i == n);
        const bool is_break = (!is_end && content[i] == '\n');

        if (is_break || is_end) {
            if (i > start || is_end) {
                ParagraphSpan span;
                span.start_offset = start;
                span.end_offset = i;
                span.index = index++;
                spans_.push_back(span);
            }
            start = i + 1;
        }
    }
}

int ParagraphIndexer::paragraph_at_offset(std::size_t offset) const noexcept {
    if (spans_.empty()) {
        return 0;
    }
    for (const auto& span : spans_) {
        if (offset >= span.start_offset && offset < span.end_offset) {
            return static_cast<int>(span.index);
        }
    }
    return static_cast<int>(spans_.back().index);
}

}  // namespace draftwell
